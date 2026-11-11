import React from "react";
import type { Appointment } from "@healthcare-platform/types";
import "../styles/components.css";

interface AppointmentCardProps {
  appointment: Appointment;
  patientName?: string;
  onStatusChange?: (status: "scheduled" | "completed" | "cancelled") => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  patientName = "Unknown",
  onStatusChange,
  onReschedule,
  onCancel,
}) => {
  const appointmentDate = new Date(`${appointment.date}T00:00:00`);
  const appointmentDateTime = new Date(
    `${appointment.date}T${appointment.time || "00:00"}`,
  );
  const isUpcoming = appointmentDateTime > new Date();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled":
        return "status-scheduled";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  return (
    <div className={`appointment-card ${getStatusColor(appointment.status)}`}>
      <div className="appointment-header">
        <h3>{patientName}</h3>
        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
          {appointment.status || "scheduled"}
        </span>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <label>Date:</label>
          <span>{appointmentDate.toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <label>Time:</label>
          <span>{appointment.time || "Not specified"}</span>
        </div>
        <div className="detail-row">
          <label>Reason:</label>
          <span>{appointment.reason || "Not specified"}</span>
        </div>
      </div>

      {isUpcoming && appointment.status === "scheduled" && (
        <div className="appointment-actions">
          <button
            className="btn-success btn-sm"
            onClick={() => onStatusChange?.("completed")}
          >
            Mark Complete
          </button>
          <button className="btn-warning btn-sm" onClick={onReschedule}>
            Reschedule
          </button>
          <button className="btn-danger btn-sm" onClick={() => onCancel?.()}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
