"""Celery task for PDF ingestion: extract pages, generate covers, upload to S3.

Celery workers run synchronously, so we use pymongo (not motor/beanie)
for database updates and boto3 for S3 operations directly.
"""

import io
import tempfile
from datetime import datetime

import fitz  # PyMuPDF
import structlog
from PIL import Image
from pymongo import MongoClient

from app.config import settings
from app.services.storage import StorageService
from celery_app import celery

logger = structlog.get_logger()


def _get_sync_db():
    """Get a synchronous pymongo database connection for use in Celery tasks."""
    client = MongoClient(settings.mongo_uri)
    return client[settings.mongo_db_name]


def _update_project(db, project_id: str, update: dict) -> None:
    """Update a project document using pymongo."""
    from bson import ObjectId

    update["updated_at"] = datetime.utcnow()
    db["projects"].update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update},
    )


def _get_project(db, project_id: str) -> dict:
    """Fetch a project document using pymongo."""
    from bson import ObjectId

    return db["projects"].find_one({"_id": ObjectId(project_id)})


@celery.task(name="app.tasks.ingestion.process_upload", bind=True)
def process_upload(self, project_id: str) -> dict:
    """Extract pages from an uploaded PDF, generate covers, upload to S3.

    Steps:
    1. Download PDF from S3
    2. Validate PDF (not encrypted, has pages)
    3. Extract each page as PNG at configured DPI
    4. Upload page images to S3
    5. Generate cover image and thumbnail from page 1
    6. Update project with page count and cover URLs

    Args:
        project_id: The project document ID.

    Returns:
        Dict with page_count and status.
    """
    db = _get_sync_db()
    storage = StorageService(bucket=settings.s3_bucket_name)

    try:
        logger.info("ingestion_started", project_id=project_id)

        project = _get_project(db, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        s3_prefix = project["s3_prefix"]
        filename = project["original_filename"]
        s3_key = f"{s3_prefix}/original/{filename}"

        # Step 1: Download PDF from S3
        logger.info("downloading_pdf", project_id=project_id, key=s3_key)
        pdf_bytes = storage.download_file(s3_key)

        # Step 2: Open and validate PDF
        with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
            tmp.write(pdf_bytes)
            tmp.flush()

            doc = fitz.open(tmp.name)

        if doc.is_encrypted:
            raise ValueError("PDF is password-protected")

        page_count = len(doc)
        if page_count == 0:
            raise ValueError("PDF has no pages")

        logger.info(
            "pdf_validated",
            project_id=project_id,
            page_count=page_count,
        )

        # Step 3 & 4: Extract and upload each page
        dpi = settings.page_extraction_dpi
        scale = dpi / 72  # PDF default is 72 DPI
        matrix = fitz.Matrix(scale, scale)

        for i in range(page_count):
            page = doc[i]
            pix = page.get_pixmap(matrix=matrix)
            png_bytes = pix.tobytes("png")

            page_key = f"{s3_prefix}/pages/{i + 1:03d}.png"
            storage.upload_file(page_key, png_bytes, "image/png")

            logger.info(
                "page_extracted",
                project_id=project_id,
                page=i + 1,
                total=page_count,
            )

        # Step 5: Generate cover and thumbnail from page 1
        first_page = doc[0]
        cover_pix = first_page.get_pixmap(matrix=matrix)
        cover_bytes = cover_pix.tobytes("png")

        cover_key = f"{s3_prefix}/covers/original.png"
        storage.upload_file(cover_key, cover_bytes, "image/png")

        # Generate thumbnail
        cover_image = Image.open(io.BytesIO(cover_bytes))
        thumb_size = (
            settings.cover_thumbnail_width,
            settings.cover_thumbnail_height,
        )
        cover_image.thumbnail(thumb_size, Image.Resampling.LANCZOS)
        thumb_buffer = io.BytesIO()
        cover_image.save(thumb_buffer, format="PNG")
        thumb_bytes = thumb_buffer.getvalue()

        thumb_key = f"{s3_prefix}/covers/thumbnail.png"
        storage.upload_file(thumb_key, thumb_bytes, "image/png")

        doc.close()

        # Step 6: Update project
        _update_project(
            db,
            project_id,
            {
                "page_count": page_count,
                "cover_url": cover_key,
                "thumbnail_url": thumb_key,
                "status": "analyzing",
                "pipeline_progress": {"extraction": "complete"},
            },
        )

        logger.info(
            "ingestion_complete",
            project_id=project_id,
            page_count=page_count,
        )

        return {
            "project_id": project_id,
            "page_count": page_count,
            "status": "complete",
        }

    except Exception as e:
        logger.error(
            "ingestion_failed",
            project_id=project_id,
            error=str(e),
        )
        _update_project(
            db,
            project_id,
            {
                "status": "failed",
                "error_message": str(e),
                "pipeline_progress": {"extraction": "failed"},
            },
        )
        raise
