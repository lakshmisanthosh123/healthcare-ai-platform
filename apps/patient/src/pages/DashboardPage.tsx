import { usePatientProfile, useAppointments } from "../hooks";
import { AppointmentCard } from "../components";
import { useTranslator } from "../hooks/useTranslator";
import "../styles/pages.css";

export const DashboardPage = () => {
  const { patient } = usePatientProfile();
  const { upcomingAppointments } = useAppointments();
  const t = useTranslator();

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>
          {t("patient.welcome")}, {patient?.firstName}! 👋
        </h1>
        <p>{t("patient.healthOverview")}</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-value">✓</div>
          <div className="stat-info">
            <h3>{t("patient.completeProfile")}</h3>
            <p>{t("patient.profileUpdated")}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{upcomingAppointments.length}</div>
          <div className="stat-info">
            <h3>{t("patient.upcoming")}</h3>
            <p>{t("patient.scheduledDoctors")}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">📋</div>
          <div className="stat-info">
            <h3>{t("patient.medicalRecords")}</h3>
            <p>{t("patient.fullHistory")}</p>
          </div>
        </div>
      </div>

      {upcomingAppointments.length > 0 && (
        <section className="upcoming-appointments">
          <h2>{t("patient.upcoming")}</h2>
          <div className="appointments-grid">
            {upcomingAppointments.slice(0, 3).map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        </section>
      )}

      <section className="quick-links">
        <h2>{t("patient.quickActions")}</h2>
        <div className="links-grid">
          <a href="/profile" className="quick-link-card">
            <span className="icon">👤</span>
            <span className="label">{t("patient.myProfile")}</span>
          </a>
          <a href="/medical-history" className="quick-link-card">
            <span className="icon">📋</span>
            <span className="label">{t("patient.medicalHistory")}</span>
          </a>
          <a href="/prescriptions" className="quick-link-card">
            <span className="icon">💊</span>
            <span className="label">{t("patient.prescriptions")}</span>
          </a>
          <a href="/appointments" className="quick-link-card">
            <span className="icon">📅</span>
            <span className="label">{t("patient.appointments")}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
