from datetime import datetime
from enum import StrEnum

from beanie import Document
from pydantic import Field


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    ANALYZING = "analyzing"
    CHARACTER_REVIEW = "character_review"
    PRODUCING = "producing"
    SCENE_REVIEW = "scene_review"
    READY = "ready"
    PUBLISHED = "published"
    FAILED = "failed"


class Project(Document):
    name: str
    status: ProjectStatus = ProjectStatus.DRAFT
    page_count: int = 0
    s3_prefix: str | None = None
    source_format: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"
