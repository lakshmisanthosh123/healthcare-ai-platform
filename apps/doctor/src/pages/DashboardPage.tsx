import React from "react";
import { useTranslator } from "../hooks/useTranslator";
import { useAppointment } from "../hooks/useAppointment";
import { usePatient } from "../hooks/usePatient";
import { AppointmentCard } from "../components/AppointmentCard";
import "../styles/DoctorListPage.css";

export const DashboardPage: React.FC = () => {
  const t = useTranslator();
  const {
    todayAppointments,
    upcomingAppointments,
    error: appointmentsError,
  } = useAppointment();
  const { patients, error: patientsError } = usePatient();

  const getPatientName = (patientId: string): string => {
    const patient = patients.find((p) => p.id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : t("common.unknownPatient");
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t("doctor.dashboard")}</h1>
        <p>{t("doctor.welcome")}</p>
      </div>

      {patientsError && (
        <div className="error-message" role="alert">
          Could not load patient totals: {patientsError}
        </div>
      )}
      {appointmentsError && (
        <div className="error-message" role="alert">
          Could not load appointments: {appointmentsError}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stats-section">
          <div className="stat-card">
            <h3>{patients.length}</h3>
            <p>{t("doctor.totalPatients")}</p>
          </div>

          <div className="stat-card">
            <h3>{todayAppointments.length}</h3>
            <p>{t("doctor.todayAppointments")}</p>
          </div>

          <div className="stat-card">
            <h3>{upcomingAppointments.length}</h3>
            <p>{t("doctor.upcomingAppointments")}</p>
          </div>
        </div>

        <div className="appointments-section">
          <div className="section-card">
            <h3>{t("doctor.todayAppointments")}</h3>
            {todayAppointments.length > 0 ? (
              <div className="appointments-list">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    patientName={getPatientName(apt.patientId)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                {t("doctor.noTodayAppointments")}
              </div>
            )}
          </div>

          <div className="section-card">
            <h3>{t("doctor.quickLinks")}</h3>
            <div className="quick-links">
              <a href="/patients" className="quick-link">
                📋 My Patients
              </a>
              <a href="/appointments" className="quick-link">
                📅 Schedule
              </a>
              <a href="/prescriptions" className="quick-link">
                💊 Prescriptions
              </a>
              <a href="/doctors" className="quick-link">
                👨‍⚕️ Doctor Directory
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
