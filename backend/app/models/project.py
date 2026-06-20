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
    user_id: str
    status: ProjectStatus = ProjectStatus.DRAFT
    page_count: int = 0
    s3_prefix: str | None = None
    source_format: str | None = None
    original_filename: str | None = None
    cover_url: str | None = None
    thumbnail_url: str | None = None
    error_message: str | None = None
    is_public: bool = False
    pipeline_progress: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"
