import os
import json
import re
from datetime import date, timedelta
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import mock_open, patch

from django.conf import settings
from django.core import mail
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.test import TransactionTestCase, override_settings
from PIL import Image
from io import StringIO
from fastapi.testclient import TestClient

from backend.fastapi.main import app as fastapi_app
from backend.django.config.api import _make_token
from healthcare.models import (
    Appointment,
    DoctorProfile,
    PatientProfile,
    StaffProfile,
)


class AuthenticationFlowTests(TransactionTestCase):
    def register_patient(self, email="taylor@example.com"):
        return self.client.post(
            "/auth/register",
            data=json.dumps({
                "firstName": "Taylor",
                "lastName": "Example",
                "email": email,
                "password": "StrongDemoPassword123!",
            }),
            content_type="application/json",
        )

    def test_both_services_report_healthy(self):
        django_response = self.client.get("/health")
        self.assertEqual(django_response.status_code, 200)
        self.assertEqual(django_response.json(), {"status": "ok"})

        fastapi_response = TestClient(fastapi_app).get("/health")
        self.assertEqual(fastapi_response.status_code, 200)
        self.assertEqual(fastapi_response.json(), {"status": "ok"})

    def test_admin_and_dashboard_apis(self):
        admin = get_user_model().objects.create_superuser(
            username="admin@example.com",
            email="admin@example.com",
            password="StrongDemoPassword123!",
        )
        response = self.client.post(
            "/auth/login",
            data=json.dumps({
                "email": admin.email,
                "password": "StrongDemoPassword123!",
            }),
            content_type="application/json",
        )
        token = response.json()["access_token"]
        client = TestClient(fastapi_app)
        headers = {"Authorization": f"Bearer {token}"}

        users = self.client.get("/api/users", headers=headers)
        self.assertEqual(users.status_code, 200, users.content)
        self.assertEqual(users.json()[0]["role"], "admin")

        patients = self.client.get("/api/admin/patients", headers=headers)
        self.assertEqual(patients.status_code, 200, patients.content)
        self.assertIsInstance(patients.json(), list)

        doctors = self.client.get("/api/admin/doctors", headers=headers)
        self.assertEqual(doctors.status_code, 200, doctors.content)
        self.assertIsInstance(doctors.json(), list)

        created_doctor = self.client.post(
            "/api/admin/doctors",
            data=json.dumps({
                "firstName": "Morgan",
                "lastName": "Doctor",
                "email": "morgan.doctor@example.com",
                "password": "TemporaryPassword123!",
                "specialty": "Family Medicine",
                "department": "Primary Care",
            }),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(created_doctor.status_code, 201, created_doctor.content)
        doctor_id = created_doctor.json()["id"]
        updated_doctor = self.client.put(
            f"/api/admin/doctors/{doctor_id}",
            data=json.dumps({"specialty": "Internal Medicine", "isActive": False}),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(updated_doctor.status_code, 200, updated_doctor.content)
        self.assertEqual(updated_doctor.json()["specialty"], "Internal Medicine")
        self.assertFalse(updated_doctor.json()["isActive"])
        reactivated_doctor = self.client.put(
            f"/api/admin/doctors/{doctor_id}",
            data=json.dumps({"isActive": True}),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(reactivated_doctor.status_code, 200)
        self.assertTrue(reactivated_doctor.json()["isActive"])

        metrics = client.get("/dashboard/metrics", headers=headers)
        self.assertEqual(metrics.status_code, 200, metrics.text)
        self.assertIn("data", metrics.json())
        analytics = client.get("/dashboard/analytics", headers=headers)
        self.assertEqual(analytics.status_code, 200, analytics.text)
        self.assertIn("appointments", analytics.json()["data"])

        saved_settings = {
            "enableMfa": True,
            "retentionDays": 730,
            "notificationEmail": "security@example.com",
            "timezone": "America/New_York",
        }
        updated_settings = self.client.put(
            "/api/admin/settings",
            data=json.dumps(saved_settings),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(updated_settings.status_code, 200, updated_settings.content)
        self.assertEqual(updated_settings.json(), saved_settings)

        invalid_settings = self.client.put(
            "/api/admin/settings",
            data=json.dumps({**saved_settings, "timezone": "Not/AZone"}),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(invalid_settings.status_code, 400)

        created_staff = self.client.post(
            "/api/staff",
            data=json.dumps({
                "firstName": "Riley",
                "lastName": "Staff",
                "email": "riley.staff@example.com",
                "password": "TemporaryPassword123!",
                "employeeId": "EMP-100",
                "jobTitle": "Coordinator",
                "department": "Operations",
                "employmentStatus": "active",
                "hireDate": "2024-03-15",
            }),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(created_staff.status_code, 201, created_staff.content)
        staff_id = created_staff.json()["id"]
        staff_profile = StaffProfile.objects.get(user_id=staff_id)
        self.assertEqual(staff_profile.hire_date.isoformat(), "2024-03-15")

        staff_token = _make_token(staff_profile.user)
        staff_client = TestClient(fastapi_app)
        staff_headers = {"Authorization": f"Bearer {staff_token}"}
        staff_dashboard = staff_client.get(
            "/api/staff/dashboard",
            headers=staff_headers,
        )
        self.assertEqual(staff_dashboard.status_code, 200, staff_dashboard.text)
        self.assertGreaterEqual(staff_dashboard.json()["totalStaff"], 1)
        staff_profile_response = staff_client.put(
            "/api/staff/profile",
            json={"phone": "555-0101", "jobTitle": "Scheduling Lead"},
            headers=staff_headers,
        )
        self.assertEqual(
            staff_profile_response.status_code,
            200,
            staff_profile_response.text,
        )
        staff_profile.refresh_from_db()
        self.assertEqual(staff_profile.phone, "555-0101")
        self.assertEqual(staff_profile.job_title, "Scheduling Lead")

        updated_staff = self.client.put(
            f"/api/staff/{staff_id}",
            data=json.dumps({
                "jobTitle": "Senior Coordinator",
                "employmentStatus": "on_leave",
            }),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(updated_staff.status_code, 200, updated_staff.content)
        staff_profile.refresh_from_db()
        self.assertEqual(staff_profile.job_title, "Senior Coordinator")
        self.assertEqual(staff_profile.employment_status, "on_leave")

        invalid_staff_update = self.client.put(
            f"/api/staff/{staff_id}",
            data=json.dumps({"employmentStatus": "unknown"}),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(invalid_staff_update.status_code, 400)

        deactivated_staff = self.client.delete(
            f"/api/staff/{staff_id}",
            headers=headers,
        )
        self.assertEqual(deactivated_staff.status_code, 200)
        staff_profile.user.refresh_from_db()
        self.assertFalse(staff_profile.user.is_active)

    def test_admin_can_create_an_admin_account_that_can_sign_in(self):
        response = self.client.post(
            "/api/admin/users",
            data=json.dumps({
                "firstName": "Casey",
                "lastName": "Admin",
                "email": "casey.admin@example.com",
                "password": "TemporaryPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

        creator = get_user_model().objects.create_superuser(
            username="creator@example.com",
            email="creator@example.com",
            password="StrongDemoPassword123!",
        )
        creator_token = _make_token(creator)
        headers = {"Authorization": f"Bearer {creator_token}"}
        created = self.client.post(
            "/api/admin/users",
            data=json.dumps({
                "firstName": "Casey",
                "lastName": "Admin",
                "email": "casey.admin@example.com",
                "password": "TemporaryPassword123!",
            }),
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(created.status_code, 201, created.content)
        self.assertEqual(created.json()["role"], "admin")
        self.assertEqual(created.json()["username"], "Casey Admin")

        login = self.client.post(
            "/auth/login",
            data=json.dumps({
                "email": "casey.admin@example.com",
                "password": "TemporaryPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200, login.content)
        self.assertEqual(login.json()["user"]["role"], "admin")

        admin_headers = {
            "Authorization": f"Bearer {login.json()['access_token']}",
        }
        users = self.client.get("/api/admin/users", headers=admin_headers)
        self.assertEqual(users.status_code, 200, users.content)
        self.assertTrue(
            any(item["email"] == "casey.admin@example.com" for item in users.json())
        )

    def test_demo_seed_command_is_repeatable(self):
        output = StringIO()
        call_command("seed_demo_data", stdout=output)
        count_after_first = get_user_model().objects.count()
        call_command("seed_demo_data", stdout=output)
        self.assertEqual(get_user_model().objects.count(), count_after_first)
        self.assertGreaterEqual(count_after_first, 4)

    def test_registration_token_is_accepted_by_fastapi(self):
        response = self.register_patient()

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["user"]["role"], "patient")

        login = self.client.post(
            "/auth/login",
            data=json.dumps({
                "email": "taylor@example.com",
                "password": "StrongDemoPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200, login.content)
        self.assertEqual(login.json()["user"]["role"], "patient")

        fastapi_response = TestClient(fastapi_app).get(
            "/auth/me",
            headers={"Authorization": f"Bearer {payload['access_token']}"},
        )
        self.assertEqual(fastapi_response.status_code, 200)
        self.assertEqual(fastapi_response.json()["email"], "taylor@example.com")

    def test_registration_rejects_staff_and_doctor_roles(self):
        for role in ("staff", "doctor", "admin"):
            with self.subTest(role=role):
                email = f"{role}@example.com"
                response = self.client.post(
                    "/auth/register",
                    data=json.dumps({
                        "firstName": "Taylor",
                        "lastName": "Example",
                        "email": email,
                        "password": "StrongDemoPassword123!",
                        "role": role,
                    }),
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 403, response.content)
                self.assertFalse(
                    get_user_model().objects.filter(email=email).exists()
                )

    def test_registration_saves_patient_profile_fields(self):
        response = self.client.post(
            "/auth/register",
            data=json.dumps({
                "firstName": "Taylor",
                "lastName": "Example",
                "email": "profile@example.com",
                "password": "StrongDemoPassword123!",
                "phone": "5551234567",
                "dateOfBirth": "1990-05-12",
                "gender": "other",
                "bloodType": "O+",
                "address": "123 Main Street",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201, response.content)

        account = get_user_model().objects.get(email="profile@example.com")
        patient = PatientProfile.objects.get(user=account)
        self.assertEqual(account.first_name, "Taylor")
        self.assertEqual(account.last_name, "Example")
        self.assertEqual(patient.phone, "5551234567")
        self.assertEqual(patient.date_of_birth.isoformat(), "1990-05-12")
        self.assertEqual(patient.blood_type, "O+")
        self.assertEqual(patient.address, "123 Main Street")

    def test_provisioned_staff_and_doctor_can_login(self):
        for role in ("staff", "doctor"):
            with self.subTest(role=role):
                email = f"{role}@example.com"
                account = get_user_model().objects.create_user(
                    username=email,
                    email=email,
                    password="StrongDemoPassword123!",
                )
                group, _ = Group.objects.get_or_create(name=role)
                account.groups.add(group)

                response = self.client.post(
                    "/auth/login",
                    data=json.dumps({
                        "email": email,
                        "password": "StrongDemoPassword123!",
                    }),
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200, response.content)
                self.assertEqual(response.json()["user"]["role"], role)

    def test_login_rejects_an_incorrect_password(self):
        self.register_patient()

        response = self.client.post(
            "/auth/login",
            data=json.dumps({
                "email": "taylor@example.com",
                "password": "incorrect",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_requires_and_consumes_verified_otp(self):
        self.register_patient()
        sent = self.client.post(
            "/auth/forgot-password",
            data=json.dumps({"email": "taylor@example.com"}),
            content_type="application/json",
        )
        self.assertEqual(sent.status_code, 200)
        code = re.search(r"\b\d{6}\b", mail.outbox[-1].body).group()

        verified = self.client.post(
            "/auth/verify-otp",
            data=json.dumps({"email": "taylor@example.com", "code": code}),
            content_type="application/json",
        )
        self.assertEqual(verified.status_code, 200)

        reset = self.client.post(
            "/auth/reset-password",
            data=json.dumps({
                "email": "taylor@example.com",
                "code": code,
                "password": "NewStrongPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(reset.status_code, 200, reset.content)
        login = self.client.post(
            "/auth/login",
            data=json.dumps({
                "email": "taylor@example.com",
                "password": "NewStrongPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200)

        replay = self.client.post(
            "/auth/reset-password",
            data=json.dumps({
                "email": "taylor@example.com",
                "code": code,
                "password": "AnotherStrongPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(replay.status_code, 400)

    def test_protected_fastapi_endpoint_requires_a_token(self):
        response = TestClient(fastapi_app).get("/auth/me")
        self.assertEqual(response.status_code, 401)

    def test_patient_profile_and_appointment_apis(self):
        registration = self.register_patient()
        patient_user = get_user_model().objects.get(email="taylor@example.com")
        patient = PatientProfile.objects.get(user=patient_user)
        doctor_user = get_user_model().objects.create_user(
            username="doctor@example.com",
            email="doctor@example.com",
            password="StrongDemoPassword123!",
            first_name="Morgan",
            last_name="Doctor",
        )
        doctor_group, _ = Group.objects.get_or_create(name="doctor")
        doctor_user.groups.add(doctor_group)
        doctor = DoctorProfile.objects.create(
            user=doctor_user,
            specialty="Cardiology",
            availability=["10:00"],
        )
        client = TestClient(fastapi_app)
        patient_headers = {
            "Authorization": f"Bearer {registration.json()['access_token']}"
        }

        profile_response = client.get("/api/patients/me", headers=patient_headers)
        self.assertEqual(profile_response.status_code, 200)
        self.assertEqual(profile_response.json()["email"], "taylor@example.com")

        avatar = "data:image/png;base64,aGVsbG8="
        document = {
            "name": "insurance.txt",
            "type": "text/plain",
            "dataUrl": "data:text/plain;base64,aW5zdXJhbmNl",
            "size": 9,
        }
        updated_profile = client.put(
            "/api/patients/me",
            headers=patient_headers,
            json={"avatar": avatar, "document": document},
        )
        self.assertEqual(updated_profile.status_code, 200, updated_profile.text)
        self.assertEqual(updated_profile.json()["avatar"], avatar)
        self.assertEqual(updated_profile.json()["document"], document)

        saved_profile = client.get("/api/patients/me", headers=patient_headers)
        self.assertEqual(saved_profile.status_code, 200)
        self.assertEqual(saved_profile.json()["avatar"], avatar)
        self.assertEqual(saved_profile.json()["document"], document)

        image_buffer = BytesIO()
        Image.new("RGB", (1, 1), color="blue").save(image_buffer, format="PNG")
        with TemporaryDirectory() as media_directory:
            with override_settings(MEDIA_ROOT=Path(media_directory)):
                avatar = client.post(
                    "/api/patients/me/avatar",
                    headers=patient_headers,
                    files={"avatar": ("avatar.png", image_buffer.getvalue(), "image/png")},
                )
                self.assertEqual(avatar.status_code, 200, avatar.text)
                relative_path = avatar.json()["avatar"].removeprefix("/media/")
                self.assertTrue((Path(media_directory) / relative_path).is_file())

        appointment_day = date.today() + timedelta(days=2)
        appointment_date = appointment_day.isoformat()
        doctor_headers = {"Authorization": f"Bearer {_make_token(doctor_user)}"}
        availability = [{
            "day": appointment_day.strftime("%A").lower(),
            "from": "10:00",
            "to": "11:00",
        }]
        schedule_update = client.put(
            "/api/doctors/profile",
            headers=doctor_headers,
            json={"availability": availability},
        )
        self.assertEqual(schedule_update.status_code, 200, schedule_update.text)
        self.assertEqual(schedule_update.json()["availability"], availability)

        invalid_schedule = client.put(
            "/api/doctors/profile",
            headers=doctor_headers,
            json={"availability": [{"day": "monday", "from": "17:00", "to": "09:00"}]},
        )
        self.assertEqual(invalid_schedule.status_code, 422)
        available = client.get(
            "/api/appointments/available-slots",
            headers=patient_headers,
            params={
                "doctorId": str(doctor.user_id),
                "date": appointment_date,
            },
        )
        self.assertEqual(available.status_code, 200, available.text)
        self.assertEqual(available.json()["slots"], ["10:00", "10:30"])

        booking = client.post(
            "/api/appointments",
            headers=patient_headers,
            json={
                "doctorId": str(doctor.user_id),
                "date": (date.today() + timedelta(days=2)).isoformat(),
                "time": "10:00",
                "reason": "Routine check",
            },
        )
        self.assertEqual(booking.status_code, 200, booking.text)
        appointment_id = booking.json()["id"]
        self.assertEqual(booking.json()["status"], "scheduled")
        patient_appointments = client.get(
            "/api/appointments/me/upcoming",
            headers=patient_headers,
        )
        self.assertEqual(patient_appointments.status_code, 200)
        self.assertEqual(
            [item["id"] for item in patient_appointments.json()],
            [appointment_id],
        )

        unavailable = client.get(
            "/api/appointments/available-slots",
            headers=patient_headers,
            params={
                "doctorId": str(doctor.user_id),
                "date": appointment_date,
            },
        )
        self.assertEqual(unavailable.status_code, 200, unavailable.text)
        self.assertEqual(unavailable.json()["slots"], ["10:30"])

        duplicate_booking = client.post(
            "/api/appointments",
            headers=patient_headers,
            json={
                "doctorId": str(doctor.user_id),
                "date": appointment_date,
                "time": "10:00",
                "reason": "Routine check",
            },
        )
        self.assertEqual(duplicate_booking.status_code, 409)

        outside_schedule = client.post(
            "/api/appointments",
            headers=patient_headers,
            json={
                "doctorId": str(doctor.user_id),
                "date": appointment_date,
                "time": "11:00",
                "reason": "Routine check",
            },
        )
        self.assertEqual(outside_schedule.status_code, 409)

        doctor_headers = {"Authorization": f"Bearer {_make_token(doctor_user)}"}
        doctor_list = client.get("/api/appointments/doctor/all", headers=doctor_headers)
        self.assertEqual(doctor_list.status_code, 200, doctor_list.text)
        self.assertEqual(len(doctor_list.json()["data"]), 1)

        forbidden = client.put(
            f"/api/appointments/{appointment_id}/status",
            headers=patient_headers,
            json={"status": "completed"},
        )
        self.assertEqual(forbidden.status_code, 403, forbidden.text)

        completed = client.put(
            f"/api/appointments/{appointment_id}/status",
            headers=doctor_headers,
            json={"status": "completed"},
        )
        self.assertEqual(completed.status_code, 200, completed.text)

        note = client.post(
            f"/api/patients/{patient.user_id}/notes",
            headers=doctor_headers,
            json={"notes": "Follow-up required"},
        )
        self.assertEqual(note.status_code, 200, note.text)
        record_id = note.json()["id"]
        upload = client.post(
            f"/api/medical-history/{record_id}/attachments",
            headers=doctor_headers,
            files={"attachment": ("visit.txt", b"visit notes", "text/plain")},
        )
        self.assertEqual(upload.status_code, 200, upload.text)
        attachment_id = upload.json()["id"]
        from healthcare.models import MedicalRecord

        stored_attachment = MedicalRecord.objects.get(pk=record_id).attachments[-1]
        stored_path = (settings.MEDIA_ROOT / stored_attachment["storageName"]).resolve()

        def cleanup_attachment():
            stored_path.unlink(missing_ok=True)
            try:
                stored_path.parent.rmdir()
            except OSError:
                pass

        self.addCleanup(cleanup_attachment)
        download = client.get(
            f"/api/medical-history/{record_id}/attachment/{attachment_id}",
            headers=doctor_headers,
        )
        self.assertEqual(download.status_code, 200, download.text)
        self.assertEqual(download.content, b"visit notes")

        prescription = client.post(
            "/api/prescriptions",
            headers=doctor_headers,
            json={
                "patientId": str(patient.user_id),
                "medications": [{
                    "name": "Demo medication",
                    "dosage": "10 mg",
                    "frequency": "Daily",
                    "duration": "7 days",
                }],
            },
        )
        self.assertEqual(prescription.status_code, 200, prescription.text)
        pdf = client.get(
            f"/api/prescriptions/{prescription.json()['id']}/export-pdf",
            headers=doctor_headers,
        )
        self.assertEqual(pdf.status_code, 200, pdf.text)
        self.assertEqual(pdf.headers["content-type"], "application/pdf")
        self.assertTrue(pdf.content.startswith(b"%PDF"))


class PowerBIEmbedConfigTests(TransactionTestCase):
    def setUp(self):
        admin = get_user_model().objects.create_superuser(
            username="powerbi-admin@example.com",
            email="powerbi-admin@example.com",
            password="StrongDemoPassword123!",
        )
        self.headers = {"Authorization": f"Bearer {_make_token(admin)}"}
        self.client = TestClient(fastapi_app)

    def test_embed_configuration_reports_missing_server_settings(self):
        environment = {
            name: ""
            for name in (
                "POWERBI_TENANT_ID",
                "POWERBI_CLIENT_ID",
                "POWERBI_CLIENT_SECRET",
                "POWERBI_WORKSPACE_ID",
                "POWERBI_REPORT_ID",
            )
        }
        with patch.dict(os.environ, environment):
            response = self.client.get(
                "/dashboard/powerbi/embed-config",
                headers=self.headers,
            )

        self.assertEqual(response.status_code, 503)
        self.assertIn("POWERBI_TENANT_ID", response.json()["detail"])

    def test_embed_token_is_brokered_by_the_backend(self):
        environment = {
            "POWERBI_TENANT_ID": "tenant-id",
            "POWERBI_CLIENT_ID": "client-id",
            "POWERBI_CLIENT_SECRET": "server-only-secret",
            "POWERBI_WORKSPACE_ID": "workspace-id",
            "POWERBI_REPORT_ID": "report-id",
        }
        responses = [
            mock_open(read_data=json.dumps({"access_token": "service-token"})).return_value,
            mock_open(read_data=json.dumps({
                "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=report-id",
            })).return_value,
            mock_open(read_data=json.dumps({
                "token": "short-lived-embed-token",
                "expiration": "2026-11-10T00:00:00Z",
            })).return_value,
        ]
        with (
            patch.dict(os.environ, environment),
            patch(
                "backend.fastapi.routers.dashboard.urlopen",
                side_effect=responses,
            ) as powerbi_request,
        ):
            response = self.client.get(
                "/dashboard/powerbi/embed-config",
                headers=self.headers,
            )

        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(
            response.json()["data"],
            {
                "reportId": "report-id",
                "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=report-id",
                "accessToken": "short-lived-embed-token",
                "expiration": "2026-11-10T00:00:00Z",
            },
        )
        self.assertEqual(powerbi_request.call_count, 3)
        self.assertNotIn("server-only-secret", response.text)
