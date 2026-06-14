import boto3
from botocore.config import Config

from app.config import settings


def get_s3_client():
    """Create and return an S3 client configured for MinIO or AWS."""
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        config=Config(signature_version="s3v4"),
    )
