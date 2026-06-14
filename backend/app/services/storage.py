import structlog

from app.dependencies import get_s3_client
from app.exceptions import StorageError

logger = structlog.get_logger()


class StorageService:
    """S3 storage operations for page images and assets."""

    def __init__(self, bucket: str):
        self.bucket = bucket
        self.client = get_s3_client()

    def ensure_bucket(self) -> None:
        """Create the bucket if it doesn't exist."""
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except self.client.exceptions.ClientError:
            self.client.create_bucket(Bucket=self.bucket)
            logger.info("bucket_created", bucket=self.bucket)

    def upload_file(self, key: str, data: bytes, content_type: str) -> str:
        """Upload a file to S3 and return the key."""
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
            logger.info("file_uploaded", bucket=self.bucket, key=key)
            return key
        except Exception as e:
            raise StorageError(
                message="Failed to upload file to storage",
                detail=str(e),
            ) from e
