import type { Appointment } from "@healthcare-platform/types";
import "../styles/components.css";

interface AppointmentCardProps {
  appointment: Appointment;
  patientName?: string;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onView?: (id: string) => void;
}

const getStatusColor = (
  status: string,
): "scheduled" | "completed" | "cancelled" => {
  const statusMap: Record<string, "scheduled" | "completed" | "cancelled"> = {
    scheduled: "scheduled",
    completed: "completed",
    cancelled: "cancelled",
  };
  return statusMap[status] || "scheduled";
};

export const AppointmentCard = ({
  appointment,
  onReschedule,
  onCancel,
  onView,
}: AppointmentCardProps) => {
  const appointmentDate = new Date(`${appointment.date}T00:00:00`);
  const isUpcoming = appointmentDate > new Date();

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-datetime">
          <span className="appointment-date">
            {appointmentDate.toLocaleDateString()}
          </span>
          <span className="appointment-time">
            {new Date(
              `${appointment.date}T${appointment.time}`,
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <span
          className={`appointment-status ${getStatusColor(appointment.status || "")}`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <span className="label">Doctor:</span>
          <span className="value">
            {appointment.doctorName || "Dr. Unknown"}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Reason:</span>
          <span className="value">{appointment.reason}</span>
        </div>
        {appointment.notes && (
          <div className="detail-row">
            <span className="label">Notes:</span>
            <span className="value">{appointment.notes}</span>
          </div>
        )}
      </div>

      <div className="appointment-actions">
        {onView && (
          <button
            onClick={() => onView(appointment.id)}
            className="btn btn-secondary"
          >
            View Details
          </button>
        )}
        {onReschedule && isUpcoming && appointment.status === "scheduled" && (
          <button
            onClick={() => onReschedule(appointment.id)}
            className="btn btn-secondary"
          >
            Reschedule
          </button>
        )}
        {onCancel && isUpcoming && appointment.status === "scheduled" && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="btn btn-danger"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
