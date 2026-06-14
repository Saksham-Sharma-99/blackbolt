from datetime import datetime

from pydantic import BaseModel

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    name: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    status: ProjectStatus
    page_count: int
    source_format: str | None
    created_at: datetime
    updated_at: datetime
