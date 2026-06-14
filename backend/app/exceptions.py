class BlackboltError(Exception):
    """Base exception for all BLACKBOLT errors."""

    def __init__(self, message: str, detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)


class ValidationError(BlackboltError):
    """Input validation failures."""


class IngestionError(BlackboltError):
    """File processing failures during ingestion."""


class StorageError(BlackboltError):
    """S3 or MongoDB operation failures."""


class PipelineError(BlackboltError):
    """Pipeline execution failures."""
