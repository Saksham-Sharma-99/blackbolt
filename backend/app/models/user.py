from datetime import datetime

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    """User account linked to an OAuth provider via NextAuth.js."""

    email: Indexed(str, unique=True)  # type: ignore[valid-type]
    name: str | None = None
    image: str | None = None
    email_verified: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
