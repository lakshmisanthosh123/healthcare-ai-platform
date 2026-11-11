from django.conf import settings
from django.db import models
from django.utils import timezone


class PatientProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )
    phone = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=40, blank=True)
    blood_type = models.CharField(max_length=5, blank=True)
    address = models.TextField(blank=True)
    avatar = models.TextField(blank=True)
    document = models.JSONField(default=dict, blank=True)
    medical_history = models.TextField(blank=True)


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )
    phone = models.CharField(max_length=30, blank=True)
    specialty = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    license_number = models.CharField(max_length=100, blank=True, unique=True, null=True)
    gender = models.CharField(max_length=40, blank=True)
    address = models.TextField(blank=True)
    avatar = models.TextField(blank=True)
    document = models.JSONField(default=dict, blank=True)
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    languages = models.JSONField(default=list, blank=True)
    availability = models.JSONField(default=list, blank=True)


class StaffProfile(models.Model):
    class EmploymentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        ON_LEAVE = "on_leave", "On leave"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )
    employee_id = models.CharField(max_length=50, blank=True, unique=True, null=True)
    phone = models.CharField(max_length=30, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )
    hire_date = models.DateField(null=True, blank=True)
    avatar = models.TextField(blank=True)
    document = models.JSONField(default=dict, blank=True)


class EmergencyContact(models.Model):
    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="emergency_contacts"
    )
    name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No show"

    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="appointments"
    )
    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.CASCADE, related_name="appointments"
    )
    date = models.DateField()
    time = models.TimeField()
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED
    )
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    reminder_confirmed = models.BooleanField(default=False)
    invoice_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-time"]


class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="medical_records"
    )
    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True
    )
    appointment = models.ForeignKey(
        Appointment, on_delete=models.SET_NULL, null=True, blank=True
    )
    date = models.DateField()
    type = models.CharField(max_length=50)
    description = models.TextField()
    doctor_name = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    attachments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Prescription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        COMPLETED = "completed", "Completed"

    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="prescriptions"
    )
    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="prescriptions",
    )
    instructions = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    reminder_time = models.CharField(max_length=100, blank=True)
    refill_requested = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Medication(models.Model):
    prescription = models.ForeignKey(
        Prescription, on_delete=models.CASCADE, related_name="medications"
    )
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100, blank=True)
    frequency = models.CharField(max_length=200, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    action = models.CharField(max_length=200)
    target = models.CharField(max_length=200, blank=True)
    severity = models.CharField(max_length=20, default="Low")
    created_at = models.DateTimeField(auto_now_add=True)


class AdminSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)


class OTPChallenge(models.Model):
    email = models.EmailField(db_index=True)
    code_hash = models.CharField(max_length=256)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="healthcare_notifications",
    )
    title = models.CharField(max_length=200)
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)


class Report(models.Model):
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="healthcare_reports",
    )
    status = models.CharField(max_length=30, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
