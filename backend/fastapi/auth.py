import os
from typing import Any

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


JWT_SECRET = os.environ.get(
    "SECRET_KEY",
    "development-only-change-this-before-deploying",
)
security = HTTPBearer(auto_error=False)


def signed_in_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Sign in to continue.")

    try:
        user = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Sign in to continue.") from error

    if (
        not user.get("sub")
        or not user.get("email")
        or user.get("role") not in {"admin", "doctor", "patient", "staff"}
    ):
        raise HTTPException(status_code=401, detail="The sign-in token is invalid.")
    return user


def require_role(user: dict[str, Any], *roles: str) -> None:
    if user.get("role") not in roles:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission for this action.",
        )
