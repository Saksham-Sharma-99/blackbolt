from datetime import datetime

from beanie import Document
from pydantic import Field


class Page(Document):
    """A single extracted page from a comic project.

    Each page is stored as a PNG image in S3, with metadata
    captured during extraction for use by downstream pipelines.
    """

    project_id: str
    page_number: int  # 1-indexed
    s3_key: str  # e.g., "projects/batman-a1b2c3/pages/0001/main.png"
    width: int  # Pixel width at extraction DPI
    height: int  # Pixel height at extraction DPI
    extraction_dpi: int  # DPI used during extraction
    file_size_bytes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "pages"
        indexes = [
            [("project_id", 1), ("page_number", 1)],
        ]
