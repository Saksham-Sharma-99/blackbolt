from fastapi import APIRouter, HTTPException, status

from app.models.project import Project
from app.schemas.project import ProjectListItem, ProjectResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/projects", response_model=list[ProjectListItem])
async def list_public_projects() -> list[ProjectListItem]:
    """List all public/featured projects. No authentication required."""
    projects = (
        await Project.find(Project.is_public == True)  # noqa: E712
        .sort(-Project.updated_at)
        .to_list()
    )
    return [
        ProjectListItem(
            id=str(p.id),
            name=p.name,
            status=p.status,
            page_count=p.page_count,
            thumbnail_url=p.thumbnail_url,
            is_public=p.is_public,
            updated_at=p.updated_at,
        )
        for p in projects
    ]


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_public_project(project_id: str) -> ProjectResponse:
    """Get details of a public project. No authentication required."""
    project = await Project.get(project_id)
    if not project or not project.is_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return ProjectResponse(
        id=str(project.id),
        name=project.name,
        status=project.status,
        page_count=project.page_count,
        source_format=project.source_format,
        original_filename=project.original_filename,
        cover_url=project.cover_url,
        thumbnail_url=project.thumbnail_url,
        error_message=project.error_message,
        is_public=project.is_public,
        pipeline_progress=project.pipeline_progress,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
