from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    # App
    app_name: str = "BLACKBOLT"
    debug: bool = False

    # MongoDB
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "blackbolt"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # S3 / MinIO
    s3_endpoint_url: str = "http://localhost:9000"
    s3_public_endpoint_url: str | None = None  # For browser-accessible presigned URLs
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket_name: str = "blackbolt"
    s3_region: str = "us-east-1"

    # File upload limits
    max_upload_size_mb: int = 100

    # Presigned URL
    s3_presigned_url_expiry: int = 3600  # 1 hour

    # Page extraction
    page_extraction_dpi: int = 150
    cover_thumbnail_width: int = 400
    cover_thumbnail_height: int = 600


settings = Settings()
