import json
import secrets
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import jwt
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import JsonResponse
from django.utils import timezone as django_timezone
from django.views.decorators.csrf import csrf_exempt


User = get_user_model()
VALID_ROLES = {"admin", "doctor", "patient", "staff"}


def _json_response(data: dict, status: int = 200) -> JsonResponse:
    return JsonResponse(data, status=status)


def _read_body(request) -> dict:
    try:
        body = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}
    return body if isinstance(body, dict) else {}


def _public_user(user) -> dict[str, str]:
    role = "admin" if user.is_staff or user.is_superuser else (
        user.groups.values_list("name", flat=True).first() or "patient"
    )
    return {
        "id": str(user.pk),
        "name": user.get_full_name() or user.username,
        "email": user.email,
        "role": role,
    }


def _make_token(user) -> str:
    public = _public_user(user)
    return jwt.encode(
        {
            "sub": public["id"],
            "email": public["email"],
            "name": public["name"],
            "role": public["role"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        },
        settings.SECRET_KEY,
        algorithm="HS256",
    )


def _current_user(request):
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    try:
        claims = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return User.objects.filter(
            pk=claims.get("sub"),
            is_active=True,
        ).first()
    except (jwt.PyJWTError, TypeError, ValueError):
        return None


def _admin_user(request):
    user = _current_user(request)
    if user is None:
        return None, _json_response({"detail": "Sign in to continue."}, 401)
    if not (
        user.is_staff
        or user.is_superuser
        or user.groups.filter(name="admin").exists()
    ):
        return None, _json_response({"detail": "Admin access is required."}, 403)
    return user, None


def _staff_data(profile):
    user = profile.user
    return {
        "id": str(user.pk),
        "employeeId": profile.employee_id or "",
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "phone": profile.phone,
        "jobTitle": profile.job_title,
        "department": profile.department,
        "employmentStatus": profile.employment_status,
        "hireDate": profile.hire_date.isoformat() if profile.hire_date else "",
        "avatar": profile.avatar,
        "document": profile.document,
        "isActive": user.is_active,
        "createdAt": user.date_joined.isoformat(),
    }


@csrf_exempt
def admin_dispatch(request, route: str) -> JsonResponse:
    from django.db import transaction
    from django.db.models import Q
    from healthcare.models import (
        AdminSetting,
        AuditLog,
        DoctorProfile,
        PatientProfile,
        StaffProfile,
    )

    if route.startswith("admin/"):
        route = route.removeprefix("admin/")

    user, error = _admin_user(request)
    if error:
        return error

    body = _read_body(request)
    method = request.method.upper()

    if route == "users" and method == "GET":
        rows = []
        for account in User.objects.all().order_by("id"):
            role = _public_user(account)["role"]
            rows.append({
                "id": str(account.pk),
                "username": account.get_full_name() or account.username,
                "email": account.email,
                "role": role,
                "status": "Active" if account.is_active else "Locked",
                "lastLogin": account.last_login.isoformat() if account.last_login else "",
                "department": "",
            })
        return JsonResponse(rows, safe=False)

    if route == "patients" and method == "GET":
        return JsonResponse([
            {
                "id": str(item.user_id), "firstName": item.user.first_name,
                "lastName": item.user.last_name, "email": item.user.email,
                "phone": item.phone, "dateOfBirth": item.date_of_birth.isoformat() if item.date_of_birth else "",
                "gender": item.gender, "bloodType": item.blood_type, "address": item.address,
                "isActive": item.user.is_active,
            }
            for item in PatientProfile.objects.select_related("user").all()
        ], safe=False)

    if route == "doctors" and method == "GET":
        return JsonResponse([_doctor_data(item) for item in DoctorProfile.objects.select_related("user").all()], safe=False)

    if route == "doctors" and method == "POST":
        return _create_role_account(body, "doctor", user)

    if route.startswith("doctors/"):
        doctor_id = route.removeprefix("doctors/")
        profile = DoctorProfile.objects.select_related("user").filter(user_id=doctor_id).first()
        if method == "DELETE":
            if profile:
                _audit(user, "Deleted doctor account", profile.user.email)
                profile.user.is_active = False
                profile.user.save(update_fields=["is_active"])
            return _json_response({"success": True})
        if method in {"PUT", "PATCH"} and profile:
            try:
                _update_account(profile.user, body)
                _update_doctor(profile, body)
            except ValueError as error:
                return _json_response({"detail": str(error)}, 400)
            _audit(user, "Updated doctor account", profile.user.email)
            return JsonResponse(_doctor_data(profile))

    if route.startswith("users/") and method == "DELETE":
        target_id = route.removeprefix("users/")
        target = User.objects.filter(pk=target_id).exclude(pk=user.pk).first()
        if target:
            target.is_active = False
            target.save(update_fields=["is_active"])
            _audit(user, "Deactivated user account", target.email)
        return _json_response({"success": True})

    if route == "roles" and method == "GET":
        roles = [
            ("admin", "Administrator", "Platform"),
            ("doctor", "Doctor", "Clinical"),
            ("patient", "Patient", "Personal"),
            ("staff", "Staff", "Operations"),
        ]
        return JsonResponse([
            {"id": key, "name": label, "scope": scope,
             "members": User.objects.filter(groups__name=key).count(),
             "description": f"{label} role"}
            for key, label, scope in roles
        ], safe=False)

    if route == "permissions" and method == "GET":
        return JsonResponse([
            {"id": "users", "name": "Manage users", "category": "Administration",
             "granted": True, "description": "Manage platform accounts."},
            {"id": "records", "name": "View health records", "category": "Clinical",
             "granted": True, "description": "Access authorized health records."},
        ], safe=False)

    if route == "settings" and method == "GET":
        item = AdminSetting.objects.filter(key="platform").first()
        return JsonResponse(item.value if item else {
            "enableMfa": True, "retentionDays": 365,
            "notificationEmail": user.email, "timezone": "UTC",
        })

    if route == "settings" and method in {"PUT", "PATCH"}:
        retention_days = body.get("retentionDays")
        notification_email = body.get("notificationEmail")
        timezone_name = body.get("timezone")
        if type(retention_days) is not int or retention_days < 1:
            return _json_response({"detail": "retentionDays must be a positive integer."}, 400)
        if not isinstance(notification_email, str):
            return _json_response({"detail": "notificationEmail must be a valid email address."}, 400)
        try:
            validate_email(notification_email)
        except ValidationError:
            return _json_response({"detail": "notificationEmail must be a valid email address."}, 400)
        if not isinstance(timezone_name, str) or not timezone_name.strip():
            return _json_response({"detail": "timezone must be a valid time zone."}, 400)
        try:
            ZoneInfo(timezone_name)
        except (ValueError, ZoneInfoNotFoundError):
            return _json_response({"detail": "timezone must be a valid time zone."}, 400)
        item, _ = AdminSetting.objects.update_or_create(key="platform", defaults={"value": body})
        _audit(user, "Updated platform settings", "platform")
        return JsonResponse(item.value)

    if route == "audit-logs" and method == "GET":
        return JsonResponse([
            {"id": str(log.pk), "actor": log.actor.get_full_name() or log.actor.email if log.actor else "System",
             "action": log.action, "target": log.target, "timestamp": log.created_at.isoformat(),
             "severity": log.severity}
            for log in AuditLog.objects.select_related("actor").order_by("-created_at")[:200]
        ], safe=False)

    if route == "staff" and method == "GET":
        query = StaffProfile.objects.select_related("user")
        search = request.GET.get("search", "")
        department = request.GET.get("department", "")
        status = request.GET.get("employmentStatus", "")
        if search:
            query = query.filter(Q(user__first_name__icontains=search) |
                                 Q(user__last_name__icontains=search) |
                                 Q(user__email__icontains=search))
        if department:
            query = query.filter(department__iexact=department)
        if status:
            query = query.filter(employment_status=status)
        return JsonResponse([_staff_data(item) for item in query], safe=False)

    if route == "staff" and method == "POST":
        return _create_role_account(body, "staff", user)

    if route.startswith("staff/"):
        staff_id = route.removeprefix("staff/")
        profile = StaffProfile.objects.select_related("user").filter(
            user_id=staff_id,
        ).first()
        if method == "DELETE":
            if profile:
                _audit(user, "Deactivated staff account", profile.user.email)
                profile.user.is_active = False
                profile.user.save(update_fields=["is_active"])
            return _json_response({"success": True})
        if method in {"PUT", "PATCH"} and profile:
            try:
                with transaction.atomic():
                    _update_account(profile.user, body)
                    _update_staff(profile, body)
            except ValueError as error:
                return _json_response({"detail": str(error)}, 400)
            _audit(user, "Updated staff account", profile.user.email)
            return JsonResponse(_staff_data(profile))

    return _json_response({"detail": "Endpoint not found."}, 404)


def _audit(actor, action, target=""):
    from healthcare.models import AuditLog

    AuditLog.objects.create(actor=actor, action=action, target=target)


def _update_account(account, body):
    for key, field in (("firstName", "first_name"), ("lastName", "last_name")):
        if key in body:
            setattr(account, field, str(body[key]).strip())
    if "name" in body:
        parts = str(body["name"]).strip().split(" ", 1)
        account.first_name = parts[0]
        account.last_name = parts[1] if len(parts) > 1 else ""
    if "email" in body:
        email = str(body["email"]).strip().lower()
        if not email or "@" not in email:
            raise ValueError("Enter a valid email address.")
        if User.objects.filter(email__iexact=email).exclude(pk=account.pk).exists():
            raise ValueError("Email is already in use.")
        account.email = account.username = email
    if "isActive" in body:
        if not isinstance(body["isActive"], bool):
            raise ValueError("isActive must be a boolean.")
        account.is_active = body["isActive"]
    account.save()


def _update_doctor(profile, body):
    fields = {
        "phone": "phone", "specialty": "specialty", "department": "department",
        "yearsOfExperience": "years_of_experience", "licenseNumber": "license_number",
        "gender": "gender", "address": "address", "bio": "bio",
        "consultationFee": "consultation_fee", "languages": "languages",
        "availability": "availability", "avatar": "avatar",
    }
    for key, field in fields.items():
        if key in body:
            setattr(profile, field, body[key] or None if field == "license_number" else body[key])
    profile.save()


def _update_staff(profile, body):
    fields = {
        "employeeId": "employee_id",
        "phone": "phone",
        "jobTitle": "job_title",
        "department": "department",
        "employmentStatus": "employment_status",
        "avatar": "avatar",
        "document": "document",
    }
    if "employmentStatus" in body:
        status = body["employmentStatus"]
        if not isinstance(status, str) or status not in {
            "active", "inactive", "on_leave",
        }:
            raise ValueError(
                "employmentStatus must be active, inactive, or on_leave."
            )
    if "hireDate" in body:
        hire_date = body["hireDate"]
        if hire_date in (None, ""):
            profile.hire_date = None
        else:
            try:
                profile.hire_date = datetime.strptime(hire_date, "%Y-%m-%d").date()
            except (TypeError, ValueError) as error:
                raise ValueError("hireDate must use YYYY-MM-DD.") from error
    if "employeeId" in body:
        employee_id = str(body["employeeId"] or "").strip()
        if (
            employee_id
            and profile.__class__.objects.filter(employee_id=employee_id)
            .exclude(pk=profile.pk)
            .exists()
        ):
            raise ValueError("Employee ID is already in use.")
        profile.employee_id = employee_id or None
    for key, field in fields.items():
        if key in body and key not in {"employeeId"}:
            setattr(profile, field, body[key])
    profile.save()


def _doctor_data(profile):
    user = profile.user
    return {
        "id": str(user.pk), "firstName": user.first_name, "lastName": user.last_name,
        "email": user.email, "phone": profile.phone, "specialty": profile.specialty,
        "department": profile.department, "yearsOfExperience": profile.years_of_experience,
        "licenseNumber": profile.license_number or "", "gender": profile.gender,
        "address": profile.address, "avatar": profile.avatar, "bio": profile.bio,
        "consultationFee": float(profile.consultation_fee), "languages": profile.languages,
        "availability": profile.availability, "isActive": user.is_active,
    }


def _create_role_account(body, role, actor):
    from healthcare.models import DoctorProfile, StaffProfile

    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    if not email or "@" not in email or User.objects.filter(email__iexact=email).exists():
        return _json_response({"detail": "Enter a unique valid email address."}, 400)
    if not isinstance(password, str) or len(password) < 8:
        return _json_response({"detail": "Password must contain at least 8 characters."}, 400)
    account = User.objects.create_user(
        username=email, email=email, password=password,
        first_name=str(body.get("firstName", "")),
        last_name=str(body.get("lastName", "")),
    )
    group, _ = Group.objects.get_or_create(name=role)
    account.groups.add(group)
    if role == "doctor":
        profile, _ = DoctorProfile.objects.get_or_create(user=account)
        _update_doctor(profile, body)
        data = _doctor_data(profile)
    else:
        profile, _ = StaffProfile.objects.get_or_create(user=account)
        try:
            _update_staff(profile, body)
        except ValueError as error:
            account.delete()
            return _json_response({"detail": str(error)}, 400)
        data = _staff_data(profile)
    _audit(actor, f"Created {role} account", email)
    return JsonResponse(data, status=201)


def _password_recovery(route: str, body: dict) -> JsonResponse:
    from healthcare.models import OTPChallenge

    email = str(body.get("email", "")).strip().lower()
    if route in {"forgot-password", "resend-otp"}:
        account = User.objects.filter(email__iexact=email, is_active=True).first()
        if account:
            code = f"{secrets.randbelow(1_000_000):06d}"
            OTPChallenge.objects.filter(email__iexact=email, used_at__isnull=True).update(
                used_at=django_timezone.now()
            )
            OTPChallenge.objects.create(
                email=email,
                code_hash=make_password(code),
                expires_at=django_timezone.now() + timedelta(minutes=10),
            )
            send_mail(
                "Healthcare Platform password reset code",
                f"Your verification code is {code}. It expires in 10 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        return _json_response({"sent": True})

    code = str(body.get("code", "")).strip()
    challenge = OTPChallenge.objects.filter(
        email__iexact=email,
        used_at__isnull=True,
        expires_at__gt=django_timezone.now(),
    ).order_by("-created_at").first()
    if challenge is None or challenge.attempts >= 5:
        return _json_response({"detail": "The verification code is invalid or expired."}, 400)

    if route == "verify-otp":
        challenge.attempts += 1
        if not check_password(code, challenge.code_hash):
            challenge.save(update_fields=["attempts"])
            return _json_response({"detail": "The verification code is invalid or expired."}, 400)
        challenge.verified_at = django_timezone.now()
        challenge.save(update_fields=["attempts", "verified_at"])
        return _json_response({"verified": True})

    password = body.get("password", "")
    if not isinstance(password, str) or len(password) < 8:
        return _json_response({"detail": "Password must contain at least 8 characters."}, 400)
    account = User.objects.filter(email__iexact=email, is_active=True).first()
    if (
        account is None
        or challenge.verified_at is None
        or not check_password(code, challenge.code_hash)
    ):
        return _json_response({"detail": "Verify a valid code before resetting the password."}, 400)
    account.set_password(password)
    account.save(update_fields=["password"])
    challenge.used_at = django_timezone.now()
    challenge.save(update_fields=["used_at"])
    return _json_response({"reset": True})


@csrf_exempt
def auth_dispatch(request, route: str) -> JsonResponse:
    body = _read_body(request)
    method = request.method.upper()

    if route == "login" and method == "POST":
        email = str(body.get("email", "")).strip().lower()
        password = body.get("password", "")
        if not email or not isinstance(password, str):
            return _json_response({"detail": "Enter your email and password."}, 400)
        user = authenticate(request, username=email, password=password)
        if user is None:
            return _json_response({"detail": "Email or password is incorrect."}, 401)
        public = _public_user(user)
        return _json_response({
            "access_token": _make_token(user),
            "token_type": "Bearer",
            "user": public,
        })

    if route == "register" and method == "POST":
        if body.get("role") not in (None, "", "patient"):
            return _json_response(
                {"detail": "Only patient accounts can be created through registration."},
                403,
            )
        email = str(body.get("email", "")).strip().lower()
        password = body.get("password", "")
        first_name = str(body.get("firstName", "")).strip()
        last_name = str(body.get("lastName", "")).strip()
        if not email or "@" not in email:
            return _json_response({"detail": "Enter a valid email address."}, 400)
        if not isinstance(password, str) or len(password) < 8:
            return _json_response({"detail": "Password must contain at least 8 characters."}, 400)
        if User.objects.filter(email__iexact=email).exists():
            return _json_response({"detail": "An account with this email already exists."}, 409)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        patient_group, _ = Group.objects.get_or_create(name="patient")
        user.groups.add(patient_group)
        from healthcare.models import PatientProfile

        patient, _ = PatientProfile.objects.get_or_create(user=user)
        patient.phone = str(body.get("phone", ""))
        patient.gender = str(body.get("gender", ""))
        patient.blood_type = str(body.get("bloodType", ""))
        patient.address = str(body.get("address", ""))
        date_of_birth = body.get("dateOfBirth")
        if date_of_birth:
            try:
                patient.date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            except (TypeError, ValueError):
                user.delete()
                return _json_response({"detail": "dateOfBirth must use YYYY-MM-DD."}, 400)
        patient.save()
        return _json_response({
            "access_token": _make_token(user),
            "token_type": "Bearer",
            "user": _public_user(user),
        }, 201)

    if route in {"forgot-password", "verify-otp", "resend-otp", "reset-password"} and method == "POST":
        return _password_recovery(route, body)

    user = _current_user(request)
    if user is None:
        return _json_response({"detail": "Sign in to continue."}, 401)

    if route == "me" and method in {"GET", "PUT", "PATCH"}:
        if method != "GET":
            if "firstName" in body:
                user.first_name = str(body["firstName"]).strip()
            if "lastName" in body:
                user.last_name = str(body["lastName"]).strip()
            if "name" in body:
                parts = str(body["name"]).strip().split(" ", 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""
            if "email" in body:
                email = str(body["email"]).strip().lower()
                if not email or "@" not in email:
                    return _json_response({"detail": "Enter a valid email address."}, 400)
                if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
                    return _json_response({"detail": "An account with this email already exists."}, 409)
                user.email = email
                user.username = email
            user.save()
        return _json_response(_public_user(user))

    if route == "logout" and method == "POST":
        return _json_response({"success": True})

    return _json_response({"detail": "Endpoint not found."}, 404)
