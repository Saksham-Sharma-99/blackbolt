from celery import Celery

from app.config import settings

celery = Celery(
    "blackbolt",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_routes={
        "app.tasks.ingestion.*": {"queue": "ingestion"},
    },
)

# Auto-discover tasks in app/tasks/
celery.autodiscover_tasks(["app.tasks"])
