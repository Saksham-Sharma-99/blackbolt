from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture
def mock_storage():
    """Return a mocked StorageService."""
    storage = MagicMock()
    storage.ensure_bucket.return_value = None
    storage.generate_presigned_put_url.return_value = (
        "http://minio:9000/blackbolt/test-presigned-url"
    )
    storage.generate_presigned_get_url.return_value = (
        "http://minio:9000/blackbolt/test-get-url"
    )
    storage.object_exists.return_value = True
    storage.upload_file.return_value = "test-key"
    storage.download_file.return_value = b"fake-pdf-bytes"
    storage.list_objects.return_value = [
        "users/u1/projects/p1/pages/001.png",
        "users/u1/projects/p1/pages/002.png",
    ]
    return storage


@pytest.fixture
def mock_celery_task():
    """Mock Celery task dispatch."""
    mock_result = MagicMock()
    mock_result.id = "test-task-id-123"
    with patch("app.routers.projects.process_upload") as mock_task:
        mock_task.delay.return_value = mock_result
        yield mock_task
