import boto3
import structlog
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import settings
from app.exceptions import StorageError

logger = structlog.get_logger()


def _create_s3_client(endpoint_url: str | None = None):
    """Create an S3 client configured for MinIO or AWS."""
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url or settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        config=Config(signature_version="s3v4"),
    )


class StorageService:
    """S3 storage operations for page images and assets."""

    def __init__(self, bucket: str):
        self.bucket = bucket
        # Internal client for backend operations (uses Docker-internal hostname)
        self.client = _create_s3_client(settings.s3_endpoint_url)
        # Public client for presigned URLs (uses browser-accessible hostname)
        public_url = settings.s3_public_endpoint_url or settings.s3_endpoint_url
        self.public_client = _create_s3_client(public_url)

    def ensure_bucket(self) -> None:
        """Create the bucket if it doesn't exist."""
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError:
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

    def generate_presigned_put_url(
        self, key: str, content_type: str, expires_in: int = 3600
    ) -> str:
        """Generate a presigned PUT URL for direct browser upload."""
        try:
            url = self.public_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": key,
                    "ContentType": content_type,
                },
                ExpiresIn=expires_in,
            )
            logger.info("presigned_put_url_generated", key=key)
            return url
        except Exception as e:
            raise StorageError(
                message="Failed to generate presigned PUT URL",
                detail=str(e),
            ) from e

    def generate_presigned_get_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a presigned GET URL for reading an object."""
        try:
            return self.public_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        except Exception as e:
            raise StorageError(
                message="Failed to generate presigned GET URL",
                detail=str(e),
            ) from e

    def download_file(self, key: str) -> bytes:
        """Download a file from S3 and return its bytes."""
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except Exception as e:
            raise StorageError(
                message="Failed to download file from storage",
                detail=str(e),
            ) from e

    def object_exists(self, key: str) -> bool:
        """Check if an object exists in S3."""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    def list_objects(self, prefix: str) -> list[str]:
        """List object keys under a prefix."""
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
            return [obj["Key"] for obj in response.get("Contents", [])]
        except Exception as e:
            raise StorageError(
                message="Failed to list objects",
                detail=str(e),
            ) from e
