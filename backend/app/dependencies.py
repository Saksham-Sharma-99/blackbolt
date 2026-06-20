from app.config import settings
from app.services.storage import StorageService


def get_storage_service() -> StorageService:
    """Create a StorageService instance with the configured bucket."""
    return StorageService(bucket=settings.s3_bucket_name)
