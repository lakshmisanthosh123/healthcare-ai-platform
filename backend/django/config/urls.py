from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from .api import admin_dispatch, auth_dispatch


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health", health_check, name="health"),
    path("auth/<path:route>", auth_dispatch, name="auth-api"),
    path("api/<path:route>", admin_dispatch, name="admin-api"),
    path("admin/", admin.site.urls),
]
