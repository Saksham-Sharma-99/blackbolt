"""Tests for the projects API endpoints.

These tests mock Beanie model operations to avoid requiring a real MongoDB instance.
Integration tests requiring a real DB should be run via Docker Compose.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.dependencies import get_storage_service
from app.main import app
from app.middleware.auth import get_current_user
from app.models.project import Project, ProjectStatus


def _make_mock_user():
    user = MagicMock()
    user.id = "user-123"
    user.__str__ = lambda s: "user-123"
    return user


def _make_mock_project(**overrides):
    defaults = {
        "id": "proj-456",
        "name": "Test Comic",
        "user_id": "user-123",
        "status": ProjectStatus.DRAFT,
        "page_count": 0,
        "s3_prefix": "users/user-123/projects/proj-456",
        "source_format": "pdf",
        "original_filename": "test.pdf",
        "cover_url": None,
        "thumbnail_url": None,
        "error_message": None,
        "is_public": False,
        "pipeline_progress": {},
        "created_at": datetime(2024, 1, 1),
        "updated_at": datetime(2024, 1, 1),
    }
    defaults.update(overrides)
    project = MagicMock()
    for k, v in defaults.items():
        setattr(project, k, v)
    project.save = AsyncMock()
    project.insert = AsyncMock()
    return project


@pytest.fixture
def mock_user():
    return _make_mock_user()


@pytest.fixture
def override_deps(mock_storage, mock_user):
    """Override FastAPI dependencies for testing."""

    async def _fake_user():
        return mock_user

    app.dependency_overrides[get_current_user] = _fake_user
    app.dependency_overrides[get_storage_service] = lambda: mock_storage
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client(override_deps):
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


def _mock_find_returning(projects):
    """Create a mock for Project.find() that returns a chainable query."""
    mock_query = MagicMock()
    mock_query.sort = MagicMock(return_value=mock_query)
    mock_query.to_list = AsyncMock(return_value=projects)
    return MagicMock(return_value=mock_query)


@pytest.mark.asyncio
async def test_create_project(client, mock_storage, mock_celery_task):
    mock_project = _make_mock_project(
        id="proj-new",
        name="Batman Issue 1",
        original_filename="Batman Issue 1.pdf",
    )

    with patch("app.routers.projects.Project", return_value=mock_project):
        response = await client.post(
            "/api/v1/projects/",
            json={"filename": "Batman Issue 1.pdf"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "project_id" in data
    assert "presigned_url" in data


@pytest.mark.asyncio
async def test_list_projects(client, mock_user):
    projects = [_make_mock_project(id=f"proj-{i}", name=f"Comic {i}") for i in range(3)]

    with patch("app.routers.projects.Project") as mock_project_cls:
        mock_query = MagicMock()
        mock_query.sort = MagicMock(return_value=mock_query)
        mock_query.to_list = AsyncMock(return_value=projects)
        mock_project_cls.find.return_value = mock_query
        # user_id attribute for query expression
        mock_project_cls.user_id = "user_id"

        response = await client.get("/api/v1/projects/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


@pytest.mark.asyncio
async def test_get_project(client, mock_user):
    project = _make_mock_project()

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.get("/api/v1/projects/proj-456")

    assert response.status_code == 200
    assert response.json()["name"] == "Test Comic"


@pytest.mark.asyncio
async def test_get_project_not_owned(client, mock_user):
    project = _make_mock_project(user_id="other-user")

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.get("/api/v1/projects/proj-456")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_confirm_upload(client, mock_storage, mock_celery_task):
    project = _make_mock_project()

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.post("/api/v1/projects/proj-456/confirm-upload")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "analyzing"
    assert data["task_id"] == "test-task-id-123"


@pytest.mark.asyncio
async def test_confirm_upload_file_not_found(client, mock_storage, mock_celery_task):
    mock_storage.object_exists.return_value = False
    project = _make_mock_project()

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.post("/api/v1/projects/proj-456/confirm-upload")

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_project_pages(client, mock_storage):
    project = _make_mock_project()

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.get("/api/v1/projects/proj-456/pages")

    assert response.status_code == 200
    data = response.json()
    assert len(data["pages"]) == 2


@pytest.mark.asyncio
async def test_update_project(client):
    project = _make_mock_project()

    with patch.object(Project, "get", new_callable=AsyncMock, return_value=project):
        response = await client.put(
            "/api/v1/projects/proj-456",
            json={"name": "New Name"},
        )

    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
