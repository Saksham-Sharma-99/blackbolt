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
        "s3_prefix": "projects/test-comic-abc123",
        "original_filename": "test.pdf",
        "user_id": "u1",
    }

    mock_db = MagicMock()
    mock_db["projects"].find_one.return_value = project_doc
    mock_db["projects"].update_one.return_value = None
    mock_db["pages"].insert_one.return_value = None

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

    # Verify page keys use 4-digit padding and /main.png suffix
    page_calls = [call.args[0] for call in mock_task_storage.upload_file.call_args_list]
    assert "projects/test-comic-abc123/pages/0001/main.png" in page_calls
    assert "projects/test-comic-abc123/pages/0002/main.png" in page_calls
    assert "projects/test-comic-abc123/pages/0003/main.png" in page_calls
    assert "projects/test-comic-abc123/covers/original.png" in page_calls
    assert "projects/test-comic-abc123/covers/thumbnail.png" in page_calls


def test_process_upload_creates_page_documents(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    process_upload(TEST_PROJECT_ID)

    # Should insert 3 Page documents
    assert mock_mongo["pages"].insert_one.call_count == 3

    # Verify first page document fields
    first_page_doc = mock_mongo["pages"].insert_one.call_args_list[0].args[0]
    assert first_page_doc["project_id"] == TEST_PROJECT_ID
    assert first_page_doc["page_number"] == 1
    assert first_page_doc["s3_key"] == "projects/test-comic-abc123/pages/0001/main.png"
    assert first_page_doc["width"] > 0
    assert first_page_doc["height"] > 0
    assert first_page_doc["extraction_dpi"] == 150
    assert first_page_doc["file_size_bytes"] > 0

    # Verify page numbers are sequential
    for i, call in enumerate(mock_mongo["pages"].insert_one.call_args_list):
        assert call.args[0]["page_number"] == i + 1


def test_process_upload_reuses_page1_for_cover(mock_mongo, mock_task_storage):
    from app.tasks.ingestion import process_upload

    process_upload(TEST_PROJECT_ID)

    upload_calls = mock_task_storage.upload_file.call_args_list

    # Find the page 1 upload and cover upload
    page1_bytes = None
    cover_bytes = None
    for call in upload_calls:
        key = call.args[0]
        data = call.args[1]
        if key.endswith("0001/main.png"):
            page1_bytes = data
        elif key.endswith("covers/original.png"):
            cover_bytes = data

    # Cover should be the exact same bytes as page 1 (no re-render)
    assert page1_bytes is not None
    assert cover_bytes is not None
    assert page1_bytes is cover_bytes  # Same object reference, not just equal


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
