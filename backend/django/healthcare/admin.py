from django.contrib import admin

from .models import (
    AdminSetting,
    Appointment,
    AuditLog,
    DoctorProfile,
    EmergencyContact,
    MedicalRecord,
    Medication,
    Notification,
    OTPChallenge,
    PatientProfile,
    Prescription,
    Report,
    StaffProfile,
)


admin.site.register(
    [
        AdminSetting,
        Appointment,
        AuditLog,
        DoctorProfile,
        EmergencyContact,
        MedicalRecord,
        Medication,
        Notification,
        OTPChallenge,
        PatientProfile,
        Prescription,
        Report,
        StaffProfile,
    ]
)
