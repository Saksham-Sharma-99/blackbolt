"""Tests for the public API endpoints."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.project import ProjectStatus


def _make_mock_project(**overrides):
    defaults = {
        "id": "proj-pub",
        "name": "Public Comic",
        "user_id": "user-1",
        "status": ProjectStatus.ANALYZING,
        "page_count": 10,
        "s3_prefix": "users/user-1/projects/proj-pub",
        "source_format": "pdf",
        "original_filename": "comic.pdf",
        "cover_url": "covers/original.png",
        "thumbnail_url": "covers/thumbnail.png",
        "error_message": None,
        "is_public": True,
        "pipeline_progress": {"extraction": "complete"},
        "created_at": datetime(2024, 1, 1),
        "updated_at": datetime(2024, 1, 1),
    }
    defaults.update(overrides)
    project = MagicMock()
    for k, v in defaults.items():
        setattr(project, k, v)
    return project


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_list_public_projects(client):
    public_projects = [_make_mock_project(name="Featured Comic")]

    with patch("app.routers.public.Project") as mock_project_cls:
        mock_query = MagicMock()
        mock_query.sort = MagicMock(return_value=mock_query)
        mock_query.to_list = AsyncMock(return_value=public_projects)
        mock_project_cls.find.return_value = mock_query
        mock_project_cls.is_public = True

        response = await client.get("/api/v1/public/projects")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Featured Comic"


@pytest.mark.asyncio
async def test_get_public_project(client):
    project = _make_mock_project(is_public=True)

    with patch("app.routers.public.Project") as mock_project_cls:
        mock_project_cls.get = AsyncMock(return_value=project)
        response = await client.get("/api/v1/public/projects/proj-pub")

    assert response.status_code == 200
    assert response.json()["name"] == "Public Comic"


@pytest.mark.asyncio
async def test_get_private_project_returns_404(client):
    project = _make_mock_project(is_public=False)

    with patch("app.routers.public.Project") as mock_project_cls:
        mock_project_cls.get = AsyncMock(return_value=project)
        response = await client.get("/api/v1/public/projects/proj-pub")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_protected_endpoints_require_auth(client):
    """Verify that protected project endpoints return 401 without auth."""
    response = await client.get("/api/v1/projects/")
    assert response.status_code == 401

    response = await client.post(
        "/api/v1/projects/",
        json={"filename": "test.pdf"},
    )
    assert response.status_code == 401
