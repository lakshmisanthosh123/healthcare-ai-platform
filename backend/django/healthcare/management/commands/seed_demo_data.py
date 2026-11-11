import os
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from healthcare.models import Appointment, DoctorProfile, PatientProfile, StaffProfile


class Command(BaseCommand):
    help = "Create repeatable fake healthcare accounts and a sample appointment."

    @transaction.atomic
    def handle(self, *args, **options):
        password = os.environ.get("DEMO_ACCOUNT_PASSWORD", "DemoPass123!")
        User = get_user_model()
        entries = [
            ("admin@example.com", "Alex", "Morgan", "admin"),
            ("doctor@example.com", "Amelia", "Harris", "doctor"),
            ("patient@example.com", "Jordan", "Lee", "patient"),
            ("staff@example.com", "Olivia", "Martin", "staff"),
        ]
        users = {}
        for email, first, last, role in entries:
            account, created = User.objects.get_or_create(
                username=email,
                defaults={
                    "email": email,
                    "first_name": first,
                    "last_name": last,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )
            account.email = email
            account.first_name = first
            account.last_name = last
            if created:
                account.set_password(password)
            account.save()
            group, _ = Group.objects.get_or_create(name=role)
            account.groups.add(group)
            users[role] = account

        doctor, _ = DoctorProfile.objects.get_or_create(user=users["doctor"])
        doctor.specialty = "Cardiology"
        doctor.department = "Cardiology"
        doctor.consultation_fee = 120
        doctor.availability = ["09:00", "10:00", "11:00", "13:00", "14:00"]
        doctor.save()
        patient, _ = PatientProfile.objects.get_or_create(user=users["patient"])
        patient.gender = "Other"
        patient.save()
        staff, _ = StaffProfile.objects.get_or_create(user=users["staff"])
        staff.job_title = "Clinic coordinator"
        staff.department = "Operations"
        staff.save()
        Appointment.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            date=date.today() + timedelta(days=1),
            time="09:00",
            defaults={"reason": "Demo consultation"},
        )
        self.stdout.write(self.style.SUCCESS(
            "Demo data is ready. Fake account password: "
            f"{password} (set DEMO_ACCOUNT_PASSWORD to change it)."
        ))
