from datetime import datetime

from pydantic import BaseModel

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    filename: str


class ProjectUpdate(BaseModel):
    name: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    status: ProjectStatus
    page_count: int
    source_format: str | None
    original_filename: str | None
    cover_url: str | None
    thumbnail_url: str | None
    error_message: str | None
    is_public: bool
    pipeline_progress: dict
    created_at: datetime
    updated_at: datetime


class ProjectListItem(BaseModel):
    id: str
    name: str
    status: ProjectStatus
    page_count: int
    thumbnail_url: str | None
    is_public: bool
    updated_at: datetime


class CreateProjectResponse(BaseModel):
    project_id: str
    presigned_url: str


class ConfirmUploadResponse(BaseModel):
    project_id: str
    status: ProjectStatus
    task_id: str
