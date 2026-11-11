import React, { useState } from "react";
import axios from "axios";
import { useTranslator } from "../hooks/useTranslator";
import { useAppointment } from "../hooks/useAppointment";
import { usePatient } from "../hooks/usePatient";
import { ScheduleCalendar, AppointmentCard } from "../components";
import "../styles/SchedulePage.css";

export const SchedulePage: React.FC = () => {
  const t = useTranslator();
  const {
    appointments,
    todayAppointments,
    selectedDate,
    loading,
    error,
    setSelectedDate,
    updateAppointmentStatus,
    rescheduleAppointment,
  } = useAppointment();

  const { patients } = usePatient();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionError, setActionError] = useState("");

  const errorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError<{ detail?: unknown }>(error) &&
    typeof error.response?.data?.detail === "string"
      ? error.response.data.detail
      : error instanceof Error
        ? error.message
        : fallback;

  const getPatientName = (patientId: string): string => {
    const patient = patients.find((p) => p.id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : t("common.unknownPatient");
  };

  const handleStatusChange = async (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled",
  ) => {
    try {
      setActionError("");
      await updateAppointmentStatus(appointmentId, status);
    } catch (error) {
      setActionError(
        errorMessage(error, "Failed to update appointment status."),
      );
    }
  };

  const handleRescheduleClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointmentId || !newDate) {
      alert("Please select a date");
      return;
    }

    try {
      setActionError("");
      await rescheduleAppointment(selectedAppointmentId, newDate, newTime);
      setShowRescheduleModal(false);
      setSelectedAppointmentId(null);
      setNewDate("");
      setNewTime("");
    } catch (error) {
      setActionError(errorMessage(error, "Failed to reschedule appointment."));
    }
  };

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1>{t("doctor.scheduleTitle")}</h1>
        <p>{t("doctor.scheduleDescription")}</p>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {actionError && (
        <div className="error-message" role="alert">
          {actionError}
        </div>
      )}

      <div className="schedule-container">
        <div className="calendar-section">
          <ScheduleCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        <div className="appointments-section">
          {todayAppointments.length > 0 && (
            <div className="today-appointments">
              <h3>{t("doctor.todayAppointments")}</h3>
              <div className="appointments-grid">
                {todayAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    patientName={getPatientName(apt.patientId)}
                    onStatusChange={(status) =>
                      handleStatusChange(apt.id, status)
                    }
                    onReschedule={() => handleRescheduleClick(apt.id)}
                    onCancel={() => handleStatusChange(apt.id, "cancelled")}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="selected-date-appointments">
            <h3>
              {t("doctor.appointmentsFor")}{" "}
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString()}
            </h3>
            {loading ? (
              <div className="loader">Loading appointments...</div>
            ) : appointments.length > 0 ? (
              <div className="appointments-grid">
                {appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    patientName={getPatientName(apt.patientId)}
                    onStatusChange={(status) =>
                      handleStatusChange(apt.id, status)
                    }
                    onReschedule={() => handleRescheduleClick(apt.id)}
                    onCancel={() => handleStatusChange(apt.id, "cancelled")}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">{t("doctor.noAppointments")}</div>
            )}
          </div>
        </div>
      </div>

      {showRescheduleModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("doctor.rescheduleAppointment")}</h3>
              <button
                className="modal-close"
                onClick={() => setShowRescheduleModal(false)}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label>{t("doctor.newDate")}</label>
              <input
                type="date"
                value={newDate}
                min={(() => {
                  const today = new Date();
                  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                })()}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t("doctor.newTime")}</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowRescheduleModal(false)}
              >
                {t("doctor.cancel")}
              </button>
              <button className="btn-primary" onClick={handleConfirmReschedule}>
                {t("doctor.confirmReschedule")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
