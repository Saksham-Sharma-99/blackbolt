from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from beanie import init_beanie
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.exceptions import BlackboltError
from app.logging import setup_logging
from app.models.project import Project
from app.routers import health, ingestion, projects

logger = structlog.get_logger()

# All Beanie document models — add new models here as they're created
DOCUMENT_MODELS = [Project]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialize and tear down application resources."""
    setup_logging(debug=settings.debug)

    # MongoDB + Beanie
    client = AsyncIOMotorClient(settings.mongo_uri)
    await init_beanie(
        database=client[settings.mongo_db_name],
        document_models=DOCUMENT_MODELS,
    )
    logger.info("database_connected", db=settings.mongo_db_name)

    yield

    client.close()
    logger.info("database_disconnected")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    @app.exception_handler(BlackboltError)
    async def blackbolt_error_handler(
        request: Request, exc: BlackboltError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={
                "error": type(exc).__name__,
                "message": exc.message,
                "detail": exc.detail,
            },
        )

    # Routers
    app.include_router(health.router, prefix="/api/v1")
    app.include_router(projects.router, prefix="/api/v1")
    app.include_router(ingestion.router, prefix="/api/v1")

    return app


app = create_app()
