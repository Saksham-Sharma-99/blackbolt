import math
import os
import re
import unicodedata
from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.config import settings
from app.dependencies import get_storage_service
from app.middleware.auth import get_current_user
from app.models.page import Page
from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.schemas.page import PageResponse, PaginatedPagesResponse
from app.schemas.project import (
    ConfirmUploadResponse,
    CreateProjectResponse,
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.storage import StorageService
from app.tasks.ingestion import process_upload

logger = structlog.get_logger()

router = APIRouter(prefix="/projects", tags=["projects"])


def _slugify(text: str) -> str:
    """Convert text to a URL/path-safe slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def _s3_prefix(filename: str, project_id: str) -> str:
    """Generate a slug-based S3 prefix from filename and project ID."""
    name_without_ext = os.path.splitext(filename)[0]
    slug = _slugify(name_without_ext)
    short_id = str(project_id)[:6]
    return f"projects/{slug}-{short_id}"


def _presign_url(storage: StorageService, s3_key: str | None) -> str | None:
    """Convert an S3 key to a presigned GET URL, or return None."""
    if not s3_key:
        return None
    return storage.generate_presigned_get_url(s3_key)


def _project_to_response(project: Project, storage: StorageService) -> ProjectResponse:
    return ProjectResponse(
        id=str(project.id),
        name=project.name,
        status=project.status,
        page_count=project.page_count,
        source_format=project.source_format,
        original_filename=project.original_filename,
        cover_url=_presign_url(storage, project.cover_url),
        thumbnail_url=_presign_url(storage, project.thumbnail_url),
        error_message=project.error_message,
        is_public=project.is_public,
        pipeline_progress=project.pipeline_progress,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


def _project_to_list_item(project: Project, storage: StorageService) -> ProjectListItem:
    return ProjectListItem(
        id=str(project.id),
        name=project.name,
        status=project.status,
        page_count=project.page_count,
        thumbnail_url=_presign_url(storage, project.thumbnail_url),
        is_public=project.is_public,
        updated_at=project.updated_at,
    )


async def _get_owned_project(project_id: str, user: User) -> Project:
    """Fetch a project and verify ownership."""
    project = await Project.get(project_id)
    if not project or project.user_id != str(user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@router.post("/", response_model=CreateProjectResponse)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> CreateProjectResponse:
    """Create a new project and return a presigned URL for PDF upload."""
    title = os.path.splitext(body.filename)[0]

    project = Project(
        name=title,
        user_id=str(user.id),
        source_format="pdf",
        original_filename=body.filename,
    )
    await project.insert()

    prefix = _s3_prefix(body.filename, str(project.id))
    project.s3_prefix = prefix
    await project.save()

    s3_key = f"{prefix}/original/{body.filename}"
    storage.ensure_bucket()
    presigned_url = storage.generate_presigned_put_url(
        key=s3_key,
        content_type="application/pdf",
        expires_in=settings.s3_presigned_url_expiry,
    )

    logger.info(
        "project_created",
        project_id=str(project.id),
        user_id=str(user.id),
        filename=body.filename,
    )

    return CreateProjectResponse(
        project_id=str(project.id),
        presigned_url=presigned_url,
    )


@router.post(
    "/{project_id}/confirm-upload",
    response_model=ConfirmUploadResponse,
)
async def confirm_upload(
    project_id: str,
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> ConfirmUploadResponse:
    """Confirm that the file upload to S3 completed, then start ingestion."""
    project = await _get_owned_project(project_id, user)

    s3_key = f"{project.s3_prefix}/original/{project.original_filename}"
    if not storage.object_exists(s3_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload file not found in storage. Please re-upload.",
        )

    project.status = ProjectStatus.ANALYZING
    project.pipeline_progress = {"extraction": "processing"}
    project.updated_at = datetime.utcnow()
    await project.save()

    task = process_upload.delay(str(project.id))

    logger.info(
        "upload_confirmed",
        project_id=project_id,
        task_id=task.id,
    )

    return ConfirmUploadResponse(
        project_id=project_id,
        status=project.status,
        task_id=task.id,
    )


@router.get("/", response_model=list[ProjectListItem])
async def list_projects(
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> list[ProjectListItem]:
    """List the current user's projects, most recent first."""
    projects = (
        await Project.find(Project.user_id == str(user.id))
        .sort(-Project.updated_at)
        .to_list()
    )
    return [_project_to_list_item(p, storage) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> ProjectResponse:
    """Get full details for a single project."""
    project = await _get_owned_project(project_id, user)
    return _project_to_response(project, storage)


@router.get("/{project_id}/pages", response_model=PaginatedPagesResponse)
async def get_project_pages(
    project_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> PaginatedPagesResponse:
    """Return paginated page data with presigned GET URLs."""
    project = await _get_owned_project(project_id, user)

    query = {"project_id": str(project.id)}
    total = await Page.find(query).count()
    if total == 0:
        return PaginatedPagesResponse(
            pages=[], total=0, page=page, per_page=per_page, total_pages=0
        )

    total_pages = math.ceil(total / per_page)
    skip = (page - 1) * per_page

    page_docs = (
        await Page.find(query).sort("page_number").skip(skip).limit(per_page).to_list()
    )

    page_responses = [
        PageResponse(
            id=str(p.id),
            page_number=p.page_number,
            width=p.width,
            height=p.height,
            url=storage.generate_presigned_get_url(p.s3_key),
            file_size_bytes=p.file_size_bytes,
        )
        for p in page_docs
    ]

    return PaginatedPagesResponse(
        pages=page_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> ProjectResponse:
    """Update project metadata (name, etc.)."""
    project = await _get_owned_project(project_id, user)

    if body.name is not None:
        project.name = body.name

    project.updated_at = datetime.utcnow()
    await project.save()

    return _project_to_response(project, storage)
