"""Authentication dependencies for FastAPI routes.

NextAuth.js stores sessions in MongoDB's `sessions` collection.
We validate the session token from the cookie and resolve the user.
"""

from fastapi import Cookie, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import User


def _get_db() -> AsyncIOMotorDatabase:
    """Get the raw Motor database from Beanie's registry."""
    return User.get_motor_collection().database


async def get_current_user(
    next_auth_session_token: str | None = Cookie(
        default=None, alias="next-auth.session-token"
    ),
    secure_session_token: str | None = Cookie(
        default=None, alias="__Secure-next-auth.session-token"
    ),
    authjs_session_token: str | None = Cookie(
        default=None, alias="authjs.session-token"
    ),
    authjs_secure_session_token: str | None = Cookie(
        default=None, alias="__Secure-authjs.session-token"
    ),
) -> User:
    """Require a valid NextAuth.js / Auth.js session. Returns the authenticated User.

    Cookie names vary by NextAuth version and environment:
    - NextAuth v4 dev: `next-auth.session-token`
    - NextAuth v4 prod: `__Secure-next-auth.session-token`
    - Auth.js (v5) dev: `authjs.session-token`
    - Auth.js (v5) prod: `__Secure-authjs.session-token`
    """
    token = (
        authjs_session_token
        or authjs_secure_session_token
        or secure_session_token
        or next_auth_session_token
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    db = _get_db()

    # Look up session in NextAuth's sessions collection
    session = await db["sessions"].find_one({"sessionToken": token})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )

    # Resolve user from NextAuth's users collection
    user = await User.get(session["userId"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


async def get_optional_user(
    next_auth_session_token: str | None = Cookie(
        default=None, alias="next-auth.session-token"
    ),
    secure_session_token: str | None = Cookie(
        default=None, alias="__Secure-next-auth.session-token"
    ),
    authjs_session_token: str | None = Cookie(
        default=None, alias="authjs.session-token"
    ),
    authjs_secure_session_token: str | None = Cookie(
        default=None, alias="__Secure-authjs.session-token"
    ),
) -> User | None:
    """Optionally resolve the current user. Returns None if not authenticated."""
    token = (
        authjs_session_token
        or authjs_secure_session_token
        or secure_session_token
        or next_auth_session_token
    )
    if not token:
        return None

    db = _get_db()

    session = await db["sessions"].find_one({"sessionToken": token})
    if not session:
        return None

    return await User.get(session["userId"])
