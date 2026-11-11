from datetime import date, datetime, time, timedelta
from decimal import Decimal, InvalidOperation
from io import BytesIO
from pathlib import Path
from typing import Any
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Count, Q
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse, Response

from ..auth import require_role, signed_in_user


router = APIRouter()
User = get_user_model()


def _role(user: dict[str, Any]) -> str:
    return str(user["role"])


def _profile(user: dict[str, Any], role: str):
    require_role(user, role, "admin")
    account = User.objects.filter(pk=user["sub"], is_active=True).first()
    if account is None:
        raise HTTPException(status_code=401, detail="Account is inactive.")
    from healthcare.models import DoctorProfile, PatientProfile, StaffProfile

    model = {"patient": PatientProfile, "doctor": DoctorProfile, "staff": StaffProfile}[role]
    profile, _ = model.objects.get_or_create(user=account)
    return account, profile


def _name(user) -> str:
    return user.get_full_name() or user.email


def _serialize_profile(profile, role: str) -> dict[str, Any]:
    user = profile.user
    result: dict[str, Any] = {
        "id": str(user.pk),
        "firstName": user.first_name,
        "lastName": user.last_name,
        "name": _name(user),
        "email": user.email,
        "phone": profile.phone,
        "avatar": getattr(profile, "avatar", ""),
        "document": getattr(profile, "document", None) or None,
        "isActive": user.is_active,
        "createdAt": user.date_joined.isoformat(),
    }
    if role == "patient":
        result.update(
            dateOfBirth=profile.date_of_birth.isoformat() if profile.date_of_birth else "",
            gender=profile.gender,
            bloodType=profile.blood_type,
            address=profile.address,
            medicalHistory=profile.medical_history,
            emergencyContacts=[
                {
                    "id": str(item.pk),
                    "name": item.name,
                    "relationship": item.relationship,
                    "phone": item.phone,
                    "email": item.email,
                }
                for item in profile.emergency_contacts.all()
            ],
        )
    elif role == "doctor":
        result.update(
            specialty=profile.specialty,
            department=profile.department,
            yearsOfExperience=profile.years_of_experience,
            licenseNumber=profile.license_number or "",
            gender=profile.gender,
            address=profile.address,
            bio=profile.bio,
            consultationFee=float(profile.consultation_fee),
            languages=profile.languages,
            availability=profile.availability,
        )
    else:
        result.update(
            employeeId=profile.employee_id or "",
            jobTitle=profile.job_title,
            department=profile.department,
            employmentStatus=profile.employment_status,
            hireDate=profile.hire_date.isoformat() if profile.hire_date else "",
        )
    return result


def _update_profile(account, profile, body: dict[str, Any], role: str) -> None:
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
            raise HTTPException(status_code=422, detail="Enter a valid email address.")
        if User.objects.filter(email__iexact=email).exclude(pk=account.pk).exists():
            raise HTTPException(status_code=409, detail="Email is already in use.")
        account.email = email
        account.username = email
    account.save()

    fields = {
        "patient": {
            "phone": "phone", "dateOfBirth": "date_of_birth", "gender": "gender",
            "bloodType": "blood_type", "address": "address", "avatar": "avatar",
            "document": "document", "medicalHistory": "medical_history",
        },
        "doctor": {
            "phone": "phone", "specialty": "specialty", "department": "department",
            "yearsOfExperience": "years_of_experience", "licenseNumber": "license_number",
            "gender": "gender", "address": "address", "avatar": "avatar", "bio": "bio",
            "document": "document", "consultationFee": "consultation_fee", "languages": "languages",
            "availability": "availability",
        },
        "staff": {
            "employeeId": "employee_id", "phone": "phone", "jobTitle": "job_title",
            "department": "department", "employmentStatus": "employment_status",
            "hireDate": "hire_date", "avatar": "avatar", "document": "document",
        },
    }[role]
    for key, field in fields.items():
        if key not in body:
            continue
        value = body[key]
        if field in {"date_of_birth", "hire_date"}:
            try:
                value = date.fromisoformat(value) if value else None
            except (TypeError, ValueError) as error:
                raise HTTPException(status_code=422, detail=f"{key} must use YYYY-MM-DD.") from error
        if field == "consultation_fee":
            try:
                value = Decimal(str(value))
            except (TypeError, ValueError, InvalidOperation) as error:
                raise HTTPException(status_code=422, detail="consultationFee must be a number.") from error
            if not value.is_finite() or value < 0:
                raise HTTPException(status_code=422, detail="consultationFee cannot be negative.")
        if field == "years_of_experience":
            try:
                value = int(value)
            except (TypeError, ValueError) as error:
                raise HTTPException(status_code=422, detail="yearsOfExperience must be a whole number.") from error
            if value < 0:
                raise HTTPException(status_code=422, detail="yearsOfExperience cannot be negative.")
        if field == "license_number" and not value:
            value = None
        if field == "employee_id" and not value:
            value = None
        if field == "employment_status" and value not in {"active", "inactive", "on_leave"}:
            raise HTTPException(status_code=422, detail="Invalid employment status.")
        if field == "availability":
            if not isinstance(value, list):
                raise HTTPException(status_code=422, detail="availability must be a list.")
            if role == "doctor":
                valid_days = {
                    "monday", "tuesday", "wednesday", "thursday",
                    "friday", "saturday", "sunday",
                }
                for entry in value:
                    if isinstance(entry, str):
                        try:
                            time.fromisoformat(entry)
                        except ValueError as error:
                            raise HTTPException(
                                status_code=422,
                                detail="Availability times must use HH:MM.",
                            ) from error
                        continue
                    if not isinstance(entry, dict):
                        raise HTTPException(
                            status_code=422,
                            detail="Each availability entry must include a day, start, and end time.",
                        )
                    day = str(entry.get("day", "")).strip().lower()
                    try:
                        start = time.fromisoformat(str(entry.get("from", "")))
                        end = time.fromisoformat(str(entry.get("to", "")))
                    except ValueError as error:
                        raise HTTPException(
                            status_code=422,
                            detail="Availability start and end times must use HH:MM.",
                        ) from error
                    if day not in valid_days or start >= end:
                        raise HTTPException(
                            status_code=422,
                            detail="Availability requires a valid weekday and an end time after the start time.",
                        )
        if field == "languages" and not isinstance(value, list):
            raise HTTPException(status_code=422, detail=f"{key} must be a list.")
        setattr(profile, field, value)
    profile.save()


def _doctor_slots(doctor, target_date: date) -> list[str]:
    configured = doctor.availability
    if not configured:
        return []

    slots: set[str] = set()
    if all(isinstance(item, str) for item in configured):
        slots.update(time.fromisoformat(item).strftime("%H:%M") for item in configured)
    else:
        target_day = target_date.strftime("%A").lower()
        for item in configured:
            if not isinstance(item, dict):
                continue
            day = str(item.get("day", "")).strip().lower()
            if day != target_day:
                continue
            start = time.fromisoformat(str(item["from"]))
            end = time.fromisoformat(str(item["to"]))
            current_minute = start.hour * 60 + start.minute
            end_minute = end.hour * 60 + end.minute
            while current_minute < end_minute:
                slots.add(f"{current_minute // 60:02d}:{current_minute % 60:02d}")
                current_minute += 30

    now = datetime.now()
    if target_date == date.today():
        slots = {
            slot for slot in slots
            if time.fromisoformat(slot) > now.time().replace(second=0, microsecond=0)
        }
    return sorted(slots)


def _page(queryset, page: int, limit: int, serializer) -> dict[str, Any]:
    page = max(page, 1)
    limit = min(max(limit, 1), 100)
    total = queryset.count()
    results = queryset[(page - 1) * limit : page * limit]
    return {
        "data": [serializer(item) for item in results],
        "totalPages": max((total + limit - 1) // limit, 1),
        "total": total,
    }


def _appointment_data(item) -> dict[str, Any]:
    return {
        "id": str(item.pk),
        "patientId": str(item.patient.user_id),
        "patientName": _name(item.patient.user),
        "doctorId": str(item.doctor.user_id),
        "doctorName": _name(item.doctor.user),
        "date": item.date.isoformat(),
        "time": item.time.strftime("%H:%M"),
        "reason": item.reason,
        "notes": item.notes,
        "status": item.status,
        "createdAt": item.created_at.isoformat(),
        "updatedAt": item.updated_at.isoformat(),
        "rating": item.rating,
    }


def _appointment_queryset():
    from healthcare.models import Appointment

    return Appointment.objects.select_related("doctor__user", "patient__user")


def _get_appointment(appointment_id: str):
    from healthcare.models import Appointment

    try:
        pk = int(appointment_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Appointment not found.")
    try:
        appointment = _appointment_queryset().get(pk=pk)
    except Appointment.DoesNotExist as error:
        raise HTTPException(status_code=404, detail="Appointment not found.") from error
    return appointment


def _check_appointment_access(item, user: dict[str, Any]) -> None:
    if _role(user) == "admin":
        return
    if _role(user) == "patient" and str(item.patient.user_id) == str(user["sub"]):
        return
    if _role(user) == "doctor" and str(item.doctor.user_id) == str(user["sub"]):
        return
    if _role(user) == "staff":
        return
    raise HTTPException(status_code=403, detail="You cannot access this appointment.")


@router.get("/auth/me")
def api_current_user(user: dict = Depends(signed_in_user)) -> dict[str, Any]:
    return user


@router.post("/auth/logout")
def api_logout(user: dict = Depends(signed_in_user)) -> dict[str, bool]:
    return {"success": True}


@router.get("/doctors")
def list_doctors(
    page: int = 1, limit: int = 20, search: str = "",
    user: dict = Depends(signed_in_user),
) -> dict[str, Any]:
    from healthcare.models import DoctorProfile

    query = DoctorProfile.objects.select_related("user").filter(user__is_active=True)
    if search:
        query = query.filter(
            Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
            | Q(specialty__icontains=search)
        )
    return _page(query.order_by("user__last_name"), page, limit, lambda p: _serialize_profile(p, "doctor"))


@router.get("/doctors/search")
def search_doctors(q: str = "", user: dict = Depends(signed_in_user)):
    from healthcare.models import DoctorProfile

    query = DoctorProfile.objects.select_related("user").filter(user__is_active=True)
    if q:
        query = query.filter(
            Q(user__first_name__icontains=q) | Q(user__last_name__icontains=q)
            | Q(specialty__icontains=q) | Q(department__icontains=q)
        )
    return [_serialize_profile(item, "doctor") for item in query[:100]]


@router.get("/doctors/filter")
@router.get("/doctors/by-specialty")
def filter_doctors(specialty: str = "", user: dict = Depends(signed_in_user)):
    from healthcare.models import DoctorProfile

    query = DoctorProfile.objects.select_related("user").filter(user__is_active=True)
    if specialty:
        query = query.filter(specialty__icontains=specialty)
    return [_serialize_profile(item, "doctor") for item in query[:100]]


@router.get("/doctors/my-doctors")
def my_doctors(user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    from healthcare.models import Appointment

    ids = Appointment.objects.filter(patient__user_id=user["sub"]).values_list("doctor_id", flat=True).distinct()
    from healthcare.models import DoctorProfile

    return [_serialize_profile(item, "doctor") for item in DoctorProfile.objects.select_related("user").filter(pk__in=ids)]


@router.get("/doctors/profile")
def doctor_profile(user: dict = Depends(signed_in_user)):
    account, profile = _profile(user, "doctor")
    return _serialize_profile(profile, "doctor")


@router.put("/doctors/profile")
def update_doctor_profile(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    account, profile = _profile(user, "doctor")
    _update_profile(account, profile, body, "doctor")
    return _serialize_profile(profile, "doctor")


@router.put("/doctors/profile/password")
def change_doctor_password(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    account, _ = _profile(user, "doctor")
    if not account.check_password(body.get("currentPassword", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    password = body.get("newPassword", "")
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(status_code=422, detail="New password must contain at least 8 characters.")
    account.set_password(password)
    account.save()
    return {"success": True}


@router.get("/doctors/{doctor_id}/availability")
def available_slots(
    doctor_id: str = "", doctorId: str = "", date_value: str = Query("", alias="date"),
    user: dict = Depends(signed_in_user),
):
    from healthcare.models import Appointment, DoctorProfile

    doctor_id = doctor_id or doctorId
    try:
        target_date = date.fromisoformat(date_value)
        doctor = DoctorProfile.objects.get(user_id=int(doctor_id), user__is_active=True)
    except (ValueError, TypeError, DoctorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Doctor or date not found.")
    if target_date < date.today():
        return {"date": target_date.isoformat(), "doctorId": str(doctor.user_id), "slots": []}
    booked = set(Appointment.objects.filter(
        doctor=doctor, date=target_date, status="scheduled"
    ).values_list("time", flat=True))
    booked_slots = {item.strftime("%H:%M") for item in booked}
    return {"date": target_date.isoformat(), "doctorId": str(doctor.user_id),
            "slots": [
                slot for slot in _doctor_slots(doctor, target_date)
                if slot not in booked_slots
            ]}


@router.get("/doctors/{doctor_id}/reviews")
def doctor_reviews(doctor_id: str, user: dict = Depends(signed_in_user)):
    from healthcare.models import Appointment

    reviews = Appointment.objects.filter(
        doctor__user_id=doctor_id, rating__isnull=False
    ).select_related("patient__user")
    return [{"id": str(item.pk), "rating": item.rating, "patientName": _name(item.patient.user),
             "date": item.date.isoformat()} for item in reviews]


@router.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: str, user: dict = Depends(signed_in_user)):
    from healthcare.models import DoctorProfile

    profile = DoctorProfile.objects.select_related("user").filter(user_id=doctor_id, user__is_active=True).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    return _serialize_profile(profile, "doctor")


@router.get("/patients/me")
def patient_profile(user: dict = Depends(signed_in_user)):
    _, profile = _profile(user, "patient")
    return _serialize_profile(profile, "patient")


@router.put("/patients/me")
def update_patient_profile(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    account, profile = _profile(user, "patient")
    _update_profile(account, profile, body, "patient")
    return _serialize_profile(profile, "patient")


@router.get("/patients/me/emergency-contacts")
def list_emergency_contacts(user: dict = Depends(signed_in_user)):
    _, profile = _profile(user, "patient")
    return [{"id": str(item.pk), "name": item.name, "relationship": item.relationship,
             "phone": item.phone, "email": item.email} for item in profile.emergency_contacts.all()]


@router.put("/patients/me/emergency-contacts")
def replace_emergency_contacts(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    _, profile = _profile(user, "patient")
    contacts = body.get("contacts")
    if not isinstance(contacts, list) or len(contacts) > 20:
        raise HTTPException(status_code=422, detail="Contacts must be a list of at most 20 entries.")
    if any(not isinstance(item, dict) or not str(item.get("name", "")).strip() for item in contacts):
        raise HTTPException(status_code=422, detail="Every contact requires a name.")
    from healthcare.models import EmergencyContact

    EmergencyContact.objects.filter(patient=profile).delete()
    for item in contacts:
        EmergencyContact.objects.create(
            patient=profile, name=str(item["name"]).strip(),
            relationship=str(item.get("relationship", "")),
            phone=str(item.get("phone", "")), email=str(item.get("email", "")),
        )
    return list_emergency_contacts(user)


@router.post("/patients/me/avatar")
def upload_patient_avatar(
    avatar: UploadFile = File(...),
    user: dict = Depends(signed_in_user),
):
    account, profile = _profile(user, "patient")
    content_type = avatar.content_type or ""
    suffix = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" }.get(content_type)
    if suffix is None:
        raise HTTPException(status_code=415, detail="Upload a PNG, JPEG, or WebP image.")
    content = avatar.file.read(settings.MAX_UPLOAD_SIZE + 1)
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Avatar must be no larger than 5 MB.")
    signatures = {
        "image/png": content.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/jpeg": content.startswith(b"\xff\xd8\xff"),
        "image/webp": len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP",
    }
    if not signatures[content_type]:
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid image.")
    from PIL import Image, UnidentifiedImageError

    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid image.") from error
    filename = f"{uuid4().hex}{suffix}"
    avatar_dir = settings.MEDIA_ROOT / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)
    (avatar_dir / filename).write_bytes(content)
    profile.avatar = f"/media/avatars/{filename}"
    profile.save(update_fields=["avatar"])
    return {"avatar": profile.avatar}


@router.get("/patients/my-patients")
def my_patients(
    page: int = 1, limit: int = 10, search: str = "",
    user: dict = Depends(signed_in_user),
):
    require_role(user, "doctor", "admin", "staff")
    from healthcare.models import Appointment, PatientProfile

    query = PatientProfile.objects.select_related("user")
    if _role(user) == "doctor":
        patient_ids = Appointment.objects.filter(doctor__user_id=user["sub"]).values_list("patient_id", flat=True).distinct()
        query = query.filter(pk__in=patient_ids)
    if search:
        query = query.filter(Q(user__first_name__icontains=search) | Q(user__last_name__icontains=search) | Q(user__email__icontains=search))
    return _page(query.order_by("user__last_name"), page, limit, lambda p: _serialize_profile(p, "patient"))


@router.get("/patients/search")
def search_patients(q: str = "", user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    from healthcare.models import PatientProfile

    query = PatientProfile.objects.select_related("user")
    if q:
        query = query.filter(Q(user__first_name__icontains=q) | Q(user__last_name__icontains=q) | Q(user__email__icontains=q))
    return [_serialize_profile(p, "patient") for p in query[:100]]


def _get_patient(patient_id: str, user: dict[str, Any]):
    require_role(user, "doctor", "admin", "staff", "patient")
    from healthcare.models import PatientProfile

    profile = PatientProfile.objects.select_related("user").filter(user_id=patient_id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    if _role(user) == "patient" and str(profile.user_id) != str(user["sub"]):
        raise HTTPException(status_code=403, detail="You cannot access this patient.")
    if _role(user) == "doctor":
        from healthcare.models import Appointment

        if not Appointment.objects.filter(doctor__user_id=user["sub"], patient=profile).exists():
            raise HTTPException(status_code=403, detail="You do not have access to this patient.")
    return profile


@router.get("/patients/{patient_id}/medical-history")
@router.get("/patients/{patient_id}/full-details")
def patient_details(patient_id: str, user: dict = Depends(signed_in_user)):
    patient = _get_patient(patient_id, user)
    result = _serialize_profile(patient, "patient")
    from healthcare.models import Appointment, MedicalRecord, Prescription

    result["medicalRecords"] = [_medical_record(item) for item in MedicalRecord.objects.filter(patient=patient)]
    result["appointments"] = [_appointment_data(item) for item in _appointment_queryset().filter(patient=patient)]
    result["prescriptions"] = [_prescription(item) for item in Prescription.objects.filter(patient=patient)]
    return result


@router.get("/patients/{patient_id}")
def get_patient(patient_id: str, user: dict = Depends(signed_in_user)):
    return _serialize_profile(_get_patient(patient_id, user), "patient")


@router.post("/patients/{patient_id}/notes")
def add_patient_note(patient_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    patient = _get_patient(patient_id, user)
    note = str(body.get("notes", "")).strip()
    if not note:
        raise HTTPException(status_code=422, detail="A note is required.")
    from healthcare.models import MedicalRecord

    record = MedicalRecord.objects.create(
        patient=patient, date=date.today(), type="note", description=note,
        doctor_name=_name(User.objects.get(pk=user["sub"])),
    )
    return _medical_record(record)


@router.get("/appointments/available-slots")
def available_slots_alias(doctorId: str, date: str, user: dict = Depends(signed_in_user)):
    return available_slots(doctorId=doctorId, date_value=date, user=user)


@router.get("/appointments/me")
def patient_appointments(page: int = 1, limit: int = 10, status: str | None = None, user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    query = _appointment_queryset().filter(patient__user_id=user["sub"])
    if status:
        query = query.filter(status=status)
    return _page(query, page, limit, _appointment_data)


@router.get("/appointments/me/upcoming")
def patient_upcoming(user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    return [_appointment_data(item) for item in _appointment_queryset().filter(patient__user_id=user["sub"], date__gte=date.today(), status="scheduled")]


@router.get("/appointments/me/past")
def patient_past(page: int = 1, limit: int = 10, user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    return _page(_appointment_queryset().filter(patient__user_id=user["sub"], date__lt=date.today()), page, limit, _appointment_data)


@router.post("/appointments")
def create_appointment(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    from healthcare.models import Appointment, DoctorProfile, PatientProfile

    try:
        doctor = DoctorProfile.objects.get(user_id=int(body.get("doctorId")), user__is_active=True)
        target_date = date.fromisoformat(body["date"])
        target_time = time.fromisoformat(body["time"])
        patient = PatientProfile.objects.get(user_id=user["sub"])
    except (ValueError, TypeError, KeyError, DoctorProfile.DoesNotExist, PatientProfile.DoesNotExist):
        raise HTTPException(status_code=422, detail="Doctor, date, and time are required.")
    if target_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date must be in the future.")
    reason = str(body.get("reason", "")).strip()
    if len(reason) < 5:
        raise HTTPException(status_code=422, detail="Reason must be at least 5 characters.")
    if target_time.strftime("%H:%M") not in _doctor_slots(doctor, target_date):
        raise HTTPException(status_code=409, detail="This doctor is not available at the selected time.")
    if Appointment.objects.filter(doctor=doctor, date=target_date, time=target_time, status="scheduled").exists():
        raise HTTPException(status_code=409, detail="This appointment slot is already booked.")
    item = Appointment.objects.create(
        patient=patient, doctor=doctor, date=target_date, time=target_time,
        reason=reason, notes=str(body.get("notes", "")),
    )
    return _appointment_data(item)


@router.get("/appointments/doctor/all")
def doctor_appointments(page: int = 1, limit: int = 10, status: str | None = None, user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    query = _appointment_queryset()
    if _role(user) == "doctor":
        query = query.filter(doctor__user_id=user["sub"])
    if status:
        query = query.filter(status=status)
    return _page(query, page, limit, _appointment_data)


@router.get("/appointments/doctor/today")
def doctor_today(user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    query = _appointment_queryset().filter(date=date.today())
    if _role(user) == "doctor":
        query = query.filter(doctor__user_id=user["sub"])
    return [_appointment_data(item) for item in query]


@router.get("/appointments/doctor/by-date")
def doctor_by_date(date_value: str = Query(..., alias="date"), user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    try:
        target = date.fromisoformat(date_value)
    except ValueError as error:
        raise HTTPException(status_code=422, detail="Date must use YYYY-MM-DD.") from error
    query = _appointment_queryset().filter(date=target)
    if _role(user) == "doctor":
        query = query.filter(doctor__user_id=user["sub"])
    return [_appointment_data(item) for item in query]


@router.get("/appointments/doctor/upcoming")
def doctor_upcoming(days: int = 7, user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    query = _appointment_queryset().filter(date__gte=date.today(), date__lte=date.today() + timedelta(days=min(max(days, 1), 90)), status="scheduled")
    if _role(user) == "doctor":
        query = query.filter(doctor__user_id=user["sub"])
    return [_appointment_data(item) for item in query]


@router.get("/appointments/{appointment_id:int}")
def get_appointment(appointment_id: int, user: dict = Depends(signed_in_user)):
    item = _get_appointment(appointment_id)
    _check_appointment_access(item, user)
    return _appointment_data(item)


def _editable_appointment(appointment_id: str, user):
    item = _get_appointment(appointment_id)
    _check_appointment_access(item, user)
    return item


@router.put("/appointments/{appointment_id:int}/status")
def set_appointment_status(appointment_id: int, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin", "staff")
    item = _editable_appointment(appointment_id, user)
    status = body.get("status")
    if status not in {"scheduled", "completed", "cancelled", "no_show"}:
        raise HTTPException(status_code=422, detail="Invalid appointment status.")
    item.status = status
    item.save()
    return _appointment_data(item)


@router.put("/appointments/{appointment_id:int}/reschedule")
def reschedule_appointment(appointment_id: int, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    item = _editable_appointment(appointment_id, user)
    if item.status != "scheduled":
        raise HTTPException(status_code=409, detail="Only scheduled appointments can be rescheduled.")
    try:
        new_date = date.fromisoformat(body["date"])
        new_time = time.fromisoformat(body["time"]) if body.get("time") else item.time
    except (ValueError, KeyError) as error:
        raise HTTPException(status_code=422, detail="A valid appointment date is required.") from error
    if new_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date must be in the future.")
    if new_time.strftime("%H:%M") not in _doctor_slots(item.doctor, new_date):
        raise HTTPException(status_code=409, detail="This doctor is not available at the selected time.")
    from healthcare.models import Appointment

    if Appointment.objects.filter(doctor=item.doctor, date=new_date, time=new_time, status="scheduled").exclude(pk=item.pk).exists():
        raise HTTPException(status_code=409, detail="This appointment slot is already booked.")
    item.date, item.time = new_date, new_time
    item.save()
    return _appointment_data(item)


@router.put("/appointments/{appointment_id:int}/cancel")
def cancel_appointment(appointment_id: int, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    item = _editable_appointment(appointment_id, user)
    item.status = "cancelled"
    reason = str(body.get("reason", "")).strip()
    if reason:
        item.notes = f"{item.notes}\nCancellation: {reason}".strip()
    item.save()
    return _appointment_data(item)


@router.post("/appointments/{appointment_id:int}/confirm-reminder")
def confirm_reminder(appointment_id: int, user: dict = Depends(signed_in_user)):
    item = _editable_appointment(appointment_id, user)
    item.reminder_confirmed = True
    item.save()
    return {"success": True}


@router.post("/appointments/{appointment_id:int}/notes")
def add_appointment_notes(appointment_id: int, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    item = _editable_appointment(appointment_id, user)
    notes = str(body.get("notes", "")).strip()
    if not notes:
        raise HTTPException(status_code=422, detail="Notes are required.")
    item.notes = f"{item.notes}\n{notes}".strip()
    item.save()
    return _appointment_data(item)


@router.get("/medical-history/me")
def my_medical_history(page: int = 1, limit: int = 10, type: str = "", user: dict = Depends(signed_in_user)):
    require_role(user, "patient", "doctor", "admin", "staff")
    from healthcare.models import MedicalRecord

    query = MedicalRecord.objects.select_related("patient__user")
    if _role(user) == "patient":
        query = query.filter(patient__user_id=user["sub"])
    elif _role(user) == "doctor":
        query = query.filter(patient__appointments__doctor__user_id=user["sub"]).distinct()
    if type:
        query = query.filter(type__iexact=type)
    return _page(query.order_by("-date"), page, limit, _medical_record)


def _medical_record(item):
    return {"id": str(item.pk), "date": item.date.isoformat(), "type": item.type,
            "description": item.description, "doctorName": item.doctor_name,
            "notes": item.notes, "attachments": item.attachments}


@router.get("/medical-history/by-type")
def history_by_type(type: str, page: int = 1, limit: int = 10, user: dict = Depends(signed_in_user)):
    return my_medical_history(page=page, limit=limit, type=type, user=user)


@router.get("/medical-history/by-date-range")
def history_by_date(startDate: str, endDate: str, page: int = 1, limit: int = 10, user: dict = Depends(signed_in_user)):
    try:
        start, end = date.fromisoformat(startDate), date.fromisoformat(endDate)
    except ValueError as error:
        raise HTTPException(status_code=422, detail="Dates must use YYYY-MM-DD.") from error
    if start > end:
        raise HTTPException(status_code=422, detail="Start date must not be after end date.")
    from healthcare.models import MedicalRecord

    query = MedicalRecord.objects.filter(date__range=(start, end))
    if _role(user) == "patient":
        query = query.filter(patient__user_id=user["sub"])
    elif _role(user) == "doctor":
        query = query.filter(patient__appointments__doctor__user_id=user["sub"]).distinct()
    return _page(query.order_by("-date"), page, limit, _medical_record)


@router.get("/medical-history/summary")
def history_summary(user: dict = Depends(signed_in_user)):
    from healthcare.models import MedicalRecord

    query = MedicalRecord.objects.all()
    if _role(user) == "patient":
        query = query.filter(patient__user_id=user["sub"])
    return {"totalRecords": query.count(), "byType": list(query.values("type").annotate(count=Count("id")))}


@router.get("/medical-history/export-csv", response_class=PlainTextResponse)
def export_history(user: dict = Depends(signed_in_user)):
    import csv
    import io

    page = my_medical_history(page=1, limit=1000, user=user)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "date", "type", "description", "doctorName", "notes"])
    writer.writeheader()
    writer.writerows(page["data"])
    return PlainTextResponse(output.getvalue(), media_type="text/csv")


@router.get("/medical-history/{record_id}/attachment/{attachment_id}")
def get_attachment(record_id: str, attachment_id: str, user: dict = Depends(signed_in_user)):
    record = _get_medical_record(record_id, user)
    item = next(
        (entry for entry in record.attachments if str(entry.get("id")) == attachment_id),
        None,
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Attachment not found.")
    path = (settings.MEDIA_ROOT / item["storageName"]).resolve()
    if settings.MEDIA_ROOT not in path.parents or not path.is_file():
        raise HTTPException(status_code=404, detail="Attachment file not found.")
    return FileResponse(path, media_type=item["contentType"], filename=item["fileName"])


@router.post("/medical-history/{record_id}/attachments")
def upload_medical_attachment(
    record_id: str,
    attachment: UploadFile = File(...),
    user: dict = Depends(signed_in_user),
):
    record = _get_medical_record(record_id, user)
    content = attachment.file.read(settings.MAX_UPLOAD_SIZE + 1)
    if not content:
        raise HTTPException(status_code=422, detail="The attachment is empty.")
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Attachment must be no larger than 5 MB.")
    storage_name = f"records/{uuid4().hex}.bin"
    file_path = settings.MEDIA_ROOT / storage_name
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(content)
    metadata = {
        "id": uuid4().hex,
        "fileName": Path(attachment.filename or "attachment").name,
        "contentType": attachment.content_type or "application/octet-stream",
        "storageName": storage_name,
    }
    record.attachments = [*record.attachments, metadata]
    record.save(update_fields=["attachments"])
    return {"id": metadata["id"], "fileName": metadata["fileName"]}


def _get_medical_record(record_id: str, user):
    from healthcare.models import MedicalRecord

    query = MedicalRecord.objects.filter(pk=record_id)
    if _role(user) == "patient":
        query = query.filter(patient__user_id=user["sub"])
    elif _role(user) == "doctor":
        query = query.filter(patient__appointments__doctor__user_id=user["sub"])
    record = query.first()
    if record is None:
        raise HTTPException(status_code=404, detail="Medical record not found.")
    return record


@router.get("/medical-history/{record_id}")
def get_medical_record(record_id: str, user: dict = Depends(signed_in_user)):
    return _medical_record(_get_medical_record(record_id, user))


def _prescription(item):
    return {"id": str(item.pk), "doctorId": str(item.doctor.user_id) if item.doctor else "",
            "patientId": str(item.patient.user_id), "instructions": item.instructions,
            "notes": item.notes, "createdAt": item.created_at.isoformat(), "status": item.status,
            "medications": [{"name": med.name, "dosage": med.dosage, "frequency": med.frequency,
                             "duration": med.duration, "notes": med.notes} for med in item.medications.all()]}


def _prescription_query(user):
    from healthcare.models import Prescription

    query = Prescription.objects.select_related("patient__user", "doctor__user").prefetch_related("medications")
    if _role(user) == "patient":
        return query.filter(patient__user_id=user["sub"])
    if _role(user) == "doctor":
        return query.filter(doctor__user_id=user["sub"])
    return query


@router.get("/prescriptions/me")
def my_prescriptions(page: int = 1, limit: int = 10, status: str = "", user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    query = _prescription_query(user)
    if status:
        query = query.filter(status=status)
    return _page(query, page, limit, _prescription)


@router.get("/prescriptions/me/active")
def active_prescriptions(user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    return [_prescription(item) for item in _prescription_query(user).filter(status="active")]


@router.get("/prescriptions/me/by-doctor")
def prescriptions_by_doctor(doctorId: str = "", user: dict = Depends(signed_in_user)):
    require_role(user, "patient")
    query = _prescription_query(user)
    if doctorId:
        query = query.filter(doctor__user_id=doctorId)
    return [_prescription(item) for item in query]


@router.get("/prescriptions/doctor/all")
def doctor_prescriptions(page: int = 1, limit: int = 10, user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin")
    return _page(_prescription_query(user), page, limit, _prescription)


@router.get("/prescriptions/patient/{patient_id}")
def patient_prescriptions(patient_id: str, user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin")
    query = _prescription_query(user).filter(patient__user_id=patient_id)
    return [_prescription(item) for item in query]


@router.post("/prescriptions")
def create_prescription(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "doctor")
    from healthcare.models import DoctorProfile, Medication, PatientProfile, Prescription

    try:
        patient = PatientProfile.objects.get(user_id=int(body["patientId"]))
        doctor = DoctorProfile.objects.get(user_id=user["sub"])
    except (KeyError, ValueError, PatientProfile.DoesNotExist, DoctorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Patient not found.")
    meds = body.get("medications", [])
    if not isinstance(meds, list) or not meds:
        raise HTTPException(status_code=422, detail="At least one medication is required.")
    item = Prescription.objects.create(patient=patient, doctor=doctor,
        instructions=str(body.get("instructions", "")), notes=str(body.get("notes", "")))
    for med in meds:
        if not isinstance(med, dict) or not str(med.get("name", "")).strip():
            raise HTTPException(status_code=422, detail="Each medication requires a name.")
        Medication.objects.create(prescription=item, name=med["name"], dosage=med.get("dosage", ""),
            frequency=med.get("frequency", ""), duration=med.get("duration", ""), notes=med.get("notes", ""))
    return _prescription(item)


def _get_prescription(prescription_id, user):
    item = _prescription_query(user).filter(pk=prescription_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Prescription not found.")
    return item


@router.get("/prescriptions/{prescription_id}")
def get_prescription(prescription_id: str, user: dict = Depends(signed_in_user)):
    return _prescription(_get_prescription(prescription_id, user))


@router.put("/prescriptions/{prescription_id}")
def update_prescription(prescription_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "doctor")
    item = _get_prescription(prescription_id, user)
    for key in ("instructions", "notes", "status"):
        if key in body:
            setattr(item, key, body[key])
    item.save()
    if "medications" in body:
        from healthcare.models import Medication

        meds = body["medications"]
        if not isinstance(meds, list):
            raise HTTPException(status_code=422, detail="Medications must be a list.")
        item.medications.all().delete()
        for med in meds:
            Medication.objects.create(prescription=item, name=med["name"], dosage=med.get("dosage", ""),
                frequency=med.get("frequency", ""), duration=med.get("duration", ""), notes=med.get("notes", ""))
    return _prescription(item)


@router.delete("/prescriptions/{prescription_id}")
def delete_prescription(prescription_id: str, user: dict = Depends(signed_in_user)):
    require_role(user, "doctor", "admin")
    item = _get_prescription(prescription_id, user)
    item.delete()
    return {"success": True}


@router.get("/prescriptions/{prescription_id}/export-pdf")
def export_prescription(prescription_id: str, user: dict = Depends(signed_in_user)):
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    prescription = _get_prescription(prescription_id, user)
    data = _prescription(prescription)
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=letter)
    width, height = letter
    y = height - 48
    lines = [
        "Healthcare Platform - Prescription",
        f"Patient: {_name(prescription.patient.user)}",
        f"Doctor: {_name(prescription.doctor.user) if prescription.doctor else 'Not assigned'}",
        f"Date: {prescription.created_at.date().isoformat()}",
        f"Status: {prescription.status}",
        "",
        "Medications:",
    ]
    for medication in data["medications"]:
        lines.append(
            f"- {medication['name']}: {medication['dosage']} | "
            f"{medication['frequency']} | {medication['duration']}"
        )
    lines.extend(["", f"Instructions: {prescription.instructions}", f"Notes: {prescription.notes}"])
    for line in lines:
        if y < 48:
            pdf.showPage()
            y = height - 48
        pdf.drawString(48, y, line[:120])
        y -= 18
    pdf.save()
    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="prescription-{prescription.pk}.pdf"'
        },
    )


@router.post("/prescriptions/{prescription_id}/reminder")
def set_prescription_reminder(prescription_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    item = _get_prescription(prescription_id, user)
    item.reminder_time = str(body.get("reminderTime", ""))
    item.save()
    return {"success": True, "reminderTime": item.reminder_time}


@router.get("/prescriptions/{prescription_id}/refill-status")
def refill_status(prescription_id: str, user: dict = Depends(signed_in_user)):
    item = _get_prescription(prescription_id, user)
    return {"requested": item.refill_requested, "status": item.status}


@router.post("/prescriptions/{prescription_id}/request-refill")
def request_refill(prescription_id: str, user: dict = Depends(signed_in_user)):
    item = _get_prescription(prescription_id, user)
    if item.status != "active":
        raise HTTPException(status_code=409, detail="Only active prescriptions can be refilled.")
    item.refill_requested = True
    item.save()
    return {"success": True, "requested": True}


@router.get("/staff")
def list_staff(search: str = "", department: str = "", employmentStatus: str = "", user: dict = Depends(signed_in_user)):
    require_role(user, "admin", "staff")
    from healthcare.models import StaffProfile

    query = StaffProfile.objects.select_related("user")
    if search:
        query = query.filter(Q(user__first_name__icontains=search) | Q(user__last_name__icontains=search) | Q(user__email__icontains=search))
    if department:
        query = query.filter(department__iexact=department)
    if employmentStatus:
        query = query.filter(employment_status=employmentStatus)
    return [_serialize_profile(item, "staff") for item in query]


@router.post("/staff")
def create_staff(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "admin")
    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    if not email or "@" not in email or User.objects.filter(email__iexact=email).exists():
        raise HTTPException(status_code=409, detail="Enter a unique valid email.")
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must contain at least 8 characters.")
    from django.contrib.auth.models import Group
    from healthcare.models import StaffProfile

    account = User.objects.create_user(username=email, email=email, password=password,
        first_name=str(body.get("firstName", "")), last_name=str(body.get("lastName", "")))
    group, _ = Group.objects.get_or_create(name="staff")
    account.groups.add(group)
    profile = StaffProfile.objects.create(user=account)
    _update_profile(account, profile, body, "staff")
    return _serialize_profile(profile, "staff")


@router.get("/staff/profile")
def staff_profile(user: dict = Depends(signed_in_user)):
    _, profile = _profile(user, "staff")
    return _serialize_profile(profile, "staff")


@router.put("/staff/profile")
def update_staff_profile(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    account, profile = _profile(user, "staff")
    _update_profile(account, profile, body, "staff")
    return _serialize_profile(profile, "staff")


@router.put("/staff/profile/password")
def update_staff_password(body: dict[str, Any], user: dict = Depends(signed_in_user)):
    account, _ = _profile(user, "staff")
    if not account.check_password(body.get("currentPassword", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    password = body.get("newPassword", "")
    if not isinstance(password, str) or len(password) < 8:
        raise HTTPException(status_code=422, detail="New password must contain at least 8 characters.")
    account.set_password(password)
    account.save()
    return {"success": True}


@router.get("/staff/dashboard")
def staff_dashboard(user: dict = Depends(signed_in_user)):
    require_role(user, "staff", "admin")
    from healthcare.models import StaffProfile

    return {
        "totalStaff": StaffProfile.objects.count(),
        "activeStaff": StaffProfile.objects.filter(employment_status="active").count(),
        "inactiveStaff": StaffProfile.objects.filter(employment_status="inactive").count(),
        "onLeaveStaff": StaffProfile.objects.filter(employment_status="on_leave").count(),
    }


@router.get("/staff/{staff_id}")
def get_staff(staff_id: str, user: dict = Depends(signed_in_user)):
    require_role(user, "admin", "staff")
    from healthcare.models import StaffProfile

    item = StaffProfile.objects.select_related("user").filter(user_id=staff_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Staff member not found.")
    if _role(user) == "staff" and str(item.user_id) != str(user["sub"]):
        raise HTTPException(status_code=403, detail="You cannot access this staff profile.")
    return _serialize_profile(item, "staff")


@router.put("/staff/{staff_id}")
def update_staff(staff_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "admin")
    from healthcare.models import StaffProfile

    item = StaffProfile.objects.filter(user_id=staff_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Staff member not found.")
    _update_profile(item.user, item, body, "staff")
    return _serialize_profile(item, "staff")


@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: str, user: dict = Depends(signed_in_user)):
    require_role(user, "admin")
    account = User.objects.filter(pk=staff_id, groups__name="staff").first()
    if account:
        account.is_active = False
        account.save(update_fields=["is_active"])
    return {"success": True}
