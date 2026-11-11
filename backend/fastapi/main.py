import os
import sys
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from django.conf import settings as django_settings

project_root = Path(__file__).resolve().parents[2]
django_project = project_root / "backend" / "django"
sys.path.insert(0, str(project_root))
sys.path.insert(1, str(django_project))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from .auth import signed_in_user
from .routers import api_router, dashboard_router


app = FastAPI(title="Healthcare Platform API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")
app.include_router(dashboard_router, prefix="/dashboard")
app.mount(
    "/media",
    StaticFiles(directory=str(django_settings.MEDIA_ROOT), check_dir=False),
    name="media",
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/auth/me", tags=["auth"])
def current_user(user: dict = Depends(signed_in_user)) -> dict:
    """Return the identity carried by a valid Django-issued access token."""
    return user
