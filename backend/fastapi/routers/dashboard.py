import json
import os
from datetime import date, timedelta
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from django.db.models import Avg, Count, Sum
from fastapi import APIRouter, Depends, HTTPException
from django.utils import timezone

from ..auth import require_role, signed_in_user


router = APIRouter()
POWERBI_API_URL = "https://api.powerbi.com/v1.0/myorg"
POWERBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default"


def _admin(user: dict[str, Any]) -> None:
    require_role(user, "admin", "staff")


@router.get("/metrics")
def metrics(user: dict = Depends(signed_in_user)):
    _admin(user)
    from healthcare.models import Appointment, DoctorProfile, PatientProfile, StaffProfile

    values = [
        ("Patients", PatientProfile.objects.count()),
        ("Doctors", DoctorProfile.objects.count()),
        ("Appointments", Appointment.objects.count()),
        ("Staff", StaffProfile.objects.count()),
    ]
    return {"data": [{"title": name, "value": str(value), "detail": "Current total"} for name, value in values]}


@router.get("/analytics")
def analytics(user: dict = Depends(signed_in_user)):
    _admin(user)
    from healthcare.models import Appointment, DoctorProfile, PatientProfile

    today = timezone.localdate()
    month_starts = []
    for offset in range(5, -1, -1):
        month_number = today.year * 12 + today.month - 1 - offset
        month_starts.append(date(month_number // 12, month_number % 12 + 1, 1))

    counts = Appointment.objects.values("status").annotate(count=Count("id"))
    statuses = [{"label": item["status"], "value": item["count"]} for item in counts]
    doctors = list(DoctorProfile.objects.select_related("user"))
    patient_count = PatientProfile.objects.count()
    appointment_count = Appointment.objects.count()
    monthly_revenue = []
    monthly_appointments = []
    patient_growth = []
    for month in month_starts:
        appointments = Appointment.objects.filter(date__year=month.year, date__month=month.month)
        monthly_revenue.append({
            "label": month.strftime("%b"),
            "value": float(appointments.aggregate(total=Sum("amount_paid"))["total"] or 0),
        })
        monthly_appointments.append({"label": month.strftime("%b"), "value": appointments.count()})
        patient_growth.append({
            "label": month.strftime("%b"),
            "value": PatientProfile.objects.filter(
                user__date_joined__year=month.year,
                user__date_joined__month=month.month,
            ).count(),
        })

    doctor_patients = []
    doctor_ratings = []
    doctor_revenue = []
    for doctor in doctors:
        visits = Appointment.objects.filter(doctor=doctor)
        doctor_patients.append({
            "label": doctor.user.get_full_name() or doctor.user.email,
            "value": visits.values("patient_id").distinct().count(),
        })
        doctor_ratings.append({
            "label": doctor.user.get_full_name() or doctor.user.email,
            "value": float(visits.aggregate(value=Avg("rating"))["value"] or 0),
        })
        doctor_revenue.append({
            "label": doctor.user.get_full_name() or doctor.user.email,
            "value": float(visits.aggregate(value=Sum("amount_paid"))["value"] or 0),
        })

    gender_distribution = [
        {"label": item["gender"] or "Not specified", "value": item["count"]}
        for item in PatientProfile.objects.values("gender").annotate(count=Count("id"))
    ]
    age_ranges = {"0-17": 0, "18-34": 0, "35-54": 0, "55+": 0}
    for birth_date in PatientProfile.objects.exclude(date_of_birth__isnull=True).values_list("date_of_birth", flat=True):
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < 18:
            age_ranges["0-17"] += 1
        elif age < 35:
            age_ranges["18-34"] += 1
        elif age < 55:
            age_ranges["35-54"] += 1
        else:
            age_ranges["55+"] += 1
    age_distribution = [{"label": label, "value": value} for label, value in age_ranges.items()]

    payment_methods = [
        {"label": item["payment_method"] or "Not specified", "value": float(item["total"] or 0)}
        for item in Appointment.objects.filter(amount_paid__gt=0)
        .values("payment_method").annotate(total=Sum("amount_paid"))
    ]
    outstanding = sum(
        (item.invoice_amount - item.amount_paid)
        for item in Appointment.objects.exclude(invoice_amount__isnull=True)
    )
    daily_revenue = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        amount = Appointment.objects.filter(date=day).aggregate(total=Sum("amount_paid"))["total"] or 0
        daily_revenue.append({"label": day.strftime("%d %b"), "value": float(amount)})
    new_patients = patient_growth
    returning_patients = [
        {"label": month.strftime("%b"), "value": Appointment.objects.filter(
            date__year=month.year, date__month=month.month, status="completed"
        ).values("patient_id").annotate(visits=Count("id")).filter(visits__gt=1).count()}
        for month in month_starts
    ]
    no_shows = [
        {"label": status, "value": Appointment.objects.filter(status=status).count()}
        for status in ("completed", "no_show")
    ]
    peak_hours = [
        {"label": f"{hour:02d}:00", "value": Appointment.objects.filter(time__hour=hour).count()}
        for hour in range(8, 20)
    ]
    return {
        "data": {
            "executive": {
                "kpis": [
                    {"title": "Patients", "value": patient_count, "detail": "Registered patients"},
                    {"title": "Doctors", "value": len(doctors), "detail": "Registered doctors"},
                    {"title": "Appointments", "value": appointment_count, "detail": "All appointments"},
                    {"title": "Revenue", "value": float(Appointment.objects.aggregate(total=Sum("amount_paid"))["total"] or 0), "detail": "Payments recorded"},
                ],
                "monthlyRevenue": monthly_revenue,
                "monthlyAppointments": monthly_appointments,
                "patientGrowth": patient_growth,
            },
            "doctors": {
                "patientsPerDoctor": doctor_patients,
                "doctorRating": doctor_ratings,
                "revenuePerDoctor": doctor_revenue,
                "appointmentStatus": statuses,
            },
            "patients": {
                "genderDistribution": gender_distribution,
                "ageDistribution": age_distribution,
                "newPatients": new_patients,
                "returningPatients": returning_patients,
            },
            "revenue": {
                "monthlyRevenue": monthly_revenue,
                "dailyRevenue": daily_revenue,
                "paymentMethods": payment_methods,
                "outstandingPayments": [{"label": "Outstanding", "value": float(outstanding)}],
            },
            "appointments": {
                "appointmentStatus": statuses,
                "noShowAnalysis": no_shows,
                "appointmentTrend": monthly_appointments,
                "peakBookingHours": peak_hours,
            },
        }
    }


def _powerbi_json_request(
    url: str,
    *,
    data: bytes | None = None,
    headers: dict[str, str] | None = None,
    error_detail: str,
) -> dict[str, Any]:
    request = Request(url, data=data, headers=headers or {})
    try:
        with urlopen(request, timeout=15) as response:
            result = json.loads(response.read())
    except (HTTPError, URLError, TimeoutError) as error:
        raise HTTPException(status_code=502, detail=error_detail) from error
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=502,
            detail="Power BI returned an invalid response.",
        ) from error
    if not isinstance(result, dict):
        raise HTTPException(
            status_code=502,
            detail="Power BI returned an invalid response.",
        )
    return result


def _get_powerbi_embed_config() -> dict[str, str]:
    required_settings = {
        "tenant_id": "POWERBI_TENANT_ID",
        "client_id": "POWERBI_CLIENT_ID",
        "client_secret": "POWERBI_CLIENT_SECRET",
        "workspace_id": "POWERBI_WORKSPACE_ID",
        "report_id": "POWERBI_REPORT_ID",
    }
    values = {key: os.environ.get(name, "").strip() for key, name in required_settings.items()}
    missing = [
        required_settings[key]
        for key, value in values.items()
        if not value
    ]
    if missing:
        raise HTTPException(
            status_code=503,
            detail=(
                "Power BI embedding is not configured. Set these server "
                f"environment variables: {', '.join(missing)}."
            ),
        )

    tenant_id = quote(values["tenant_id"], safe="")
    workspace_id = quote(values["workspace_id"], safe="")
    report_id = quote(values["report_id"], safe="")
    identity = _powerbi_json_request(
        f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token",
        data=urlencode({
            "grant_type": "client_credentials",
            "client_id": values["client_id"],
            "client_secret": values["client_secret"],
            "scope": POWERBI_SCOPE,
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        error_detail="Power BI authentication failed.",
    )
    powerbi_access_token = identity.get("access_token")
    if not isinstance(powerbi_access_token, str) or not powerbi_access_token:
        raise HTTPException(
            status_code=502,
            detail="Power BI authentication returned no access token.",
        )

    authorization = {"Authorization": f"Bearer {powerbi_access_token}"}
    report = _powerbi_json_request(
        f"{POWERBI_API_URL}/groups/{workspace_id}/reports/{report_id}",
        headers=authorization,
        error_detail="Power BI could not load the configured report.",
    )
    embed_url = report.get("embedUrl")
    if not isinstance(embed_url, str) or not embed_url:
        raise HTTPException(
            status_code=502,
            detail="Power BI returned no embed URL for the configured report.",
        )

    embed_token = _powerbi_json_request(
        f"{POWERBI_API_URL}/groups/{workspace_id}/reports/{report_id}/GenerateToken",
        data=json.dumps({"accessLevel": "View"}).encode(),
        headers={
            **authorization,
            "Content-Type": "application/json",
        },
        error_detail="Power BI could not create an embed token.",
    )
    token = embed_token.get("token")
    if not isinstance(token, str) or not token:
        raise HTTPException(
            status_code=502,
            detail="Power BI returned no embed token for the configured report.",
        )

    result = {
        "reportId": values["report_id"],
        "embedUrl": embed_url,
        "accessToken": token,
    }
    expiration = embed_token.get("expiration")
    if isinstance(expiration, str):
        result["expiration"] = expiration
    return result


@router.get("/powerbi/embed-config")
def powerbi_embed_config(user: dict = Depends(signed_in_user)):
    _admin(user)
    return {"data": _get_powerbi_embed_config()}


@router.get("/reports")
def reports(user: dict = Depends(signed_in_user)):
    _admin(user)
    from healthcare.models import Report

    return {"data": [
        {"id": str(item.pk), "title": item.title,
         "owner": item.owner.get_full_name() if item.owner else "System",
         "status": item.status}
        for item in Report.objects.select_related("owner").order_by("-created_at")
    ]}


@router.get("/notifications")
def notifications(user: dict = Depends(signed_in_user)):
    from healthcare.models import Notification

    return {"data": [
        {"id": str(item.pk), "title": item.title, "detail": item.detail,
         "time": item.created_at.isoformat()}
        for item in Notification.objects.filter(user_id=user["sub"]).order_by("-created_at")[:100]
    ]}


@router.put("/appointments/{appointment_id}/invoice")
def save_invoice(appointment_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    require_role(user, "admin", "staff")
    from decimal import Decimal, InvalidOperation
    from healthcare.models import Appointment

    try:
        item = Appointment.objects.get(pk=appointment_id)
        amount = Decimal(str(body["invoice_amount"]))
        paid = Decimal(str(body.get("amount_paid", 0)))
    except (Appointment.DoesNotExist, KeyError, ValueError, InvalidOperation) as error:
        raise HTTPException(status_code=422, detail="Appointment and valid invoice amounts are required.") from error
    if amount < 0 or paid < 0 or paid > amount:
        raise HTTPException(status_code=422, detail="Amounts must be non-negative and paid cannot exceed invoice.")
    item.invoice_amount, item.amount_paid = amount, paid
    item.payment_method = str(body.get("payment_method", ""))
    item.save()
    return {"success": True}


@router.put("/appointments/{appointment_id}/rating")
def rate_appointment(appointment_id: str, body: dict[str, Any], user: dict = Depends(signed_in_user)):
    from healthcare.models import Appointment

    try:
        item = Appointment.objects.get(pk=appointment_id, patient__user_id=user["sub"])
        rating = int(body["rating"])
    except (Appointment.DoesNotExist, KeyError, ValueError, TypeError) as error:
        raise HTTPException(status_code=404, detail="Appointment not found.") from error
    if item.status != "completed" or not 1 <= rating <= 5:
        raise HTTPException(status_code=422, detail="Only completed visits can be rated from 1 to 5.")
    item.rating = rating
    item.save()
    return {"success": True, "rating": rating}
