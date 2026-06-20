"""Tests for the ingestion Celery task."""

from unittest.mock import MagicMock, patch

import fitz  # PyMuPDF
import pytest
from bson import ObjectId

# Use a valid ObjectId for tests
TEST_PROJECT_ID = str(ObjectId())


def _create_test_pdf(page_count: int = 3) -> bytes:
    """Create a minimal PDF in memory for testing."""
    doc = fitz.open()
    for i in range(page_count):
        page = doc.new_page(width=612, height=792)  # Letter size
        page.insert_text(
            (72, 72),
            f"Test Page {i + 1}",
            fontsize=24,
        )
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.fixture
def mock_mongo():
    """Mock pymongo for Celery task (sync DB access)."""
    project_doc = {
        "_id": ObjectId(TEST_PROJECT_ID),
        "s3_prefix": "users/u1/projects/p1",
        "original_filename": "test.pdf",
        "user_id": "u1",
    }

    mock_db = MagicMock()
    mock_db["projects"].find_one.return_value = project_doc
    mock_db["projects"].update_one.return_value = None

    with patch("app.tasks.ingestion._get_sync_db", return_value=mock_db):
        yield mock_db


@pytest.fixture
def mock_task_storage():
    """Mock StorageService for the Celery task."""
    storage = MagicMock()
    storage.upload_file.return_value = "uploaded-key"

    with patch("app.tasks.ingestion.StorageService", return_value=storage):
        storage.download_file.return_value = _create_test_pdf(3)
        yield storage


def test_process_upload_extracts_pages(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    result = process_upload(TEST_PROJECT_ID)

    assert result["page_count"] == 3
    assert result["status"] == "complete"

    # Should upload 3 pages + 1 cover + 1 thumbnail = 5 uploads
    assert mock_task_storage.upload_file.call_count == 5

    # Verify page keys
    page_calls = [call.args[0] for call in mock_task_storage.upload_file.call_args_list]
    assert "users/u1/projects/p1/pages/001.png" in page_calls
    assert "users/u1/projects/p1/pages/002.png" in page_calls
    assert "users/u1/projects/p1/pages/003.png" in page_calls
    assert "users/u1/projects/p1/covers/original.png" in page_calls
    assert "users/u1/projects/p1/covers/thumbnail.png" in page_calls


def test_process_upload_updates_project(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    process_upload(TEST_PROJECT_ID)

    # Verify project was updated with page count and cover URLs
    update_call = mock_mongo["projects"].update_one.call_args
    update_set = update_call.args[1]["$set"]
    assert update_set["page_count"] == 3
    assert update_set["status"] == "analyzing"
    assert update_set["pipeline_progress"]["extraction"] == "complete"
    assert "covers/original.png" in update_set["cover_url"]
    assert "covers/thumbnail.png" in update_set["thumbnail_url"]


def test_process_upload_handles_encrypted_pdf(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    doc = fitz.open()
    doc.new_page()
    encrypted_bytes = doc.tobytes(
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw="password",
    )
    doc.close()
    mock_task_storage.download_file.return_value = encrypted_bytes

    with pytest.raises(Exception, match="password-protected"):
        process_upload(TEST_PROJECT_ID)

    # Verify project was marked as failed
    update_call = mock_mongo["projects"].update_one.call_args
    update_set = update_call.args[1]["$set"]
    assert update_set["status"] == "failed"


def test_process_upload_handles_missing_project(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    mock_mongo["projects"].find_one.return_value = None

    with pytest.raises(ValueError, match="not found"):
        process_upload(TEST_PROJECT_ID)
