import { useState } from "react";
import { appointmentSchema } from "@healthcare-platform/validation";
import type { patientAppointment, Doctor } from "@healthcare-platform/types";

import "../styles/components.css";

const getLocalDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

interface AppointmentBookingFormProps {
  doctor: Doctor | null;
  onSubmit: (data: patientAppointment) => Promise<void>;
  loading?: boolean;
  availableSlots?: string[];
  slotsLoading?: boolean;
  slotsError?: string;
  onGetSlots?: (doctorId: string, date: string) => Promise<void>;
}

export const AppointmentBookingForm = ({
  doctor,
  onSubmit,
  loading = false,
  availableSlots = [],
  slotsLoading = false,
  slotsError = "",
  onGetSlots,
}: AppointmentBookingFormProps) => {
  const [formData, setFormData] = useState<patientAppointment>({
    doctorId: doctor?.id || "",
    date: "",
    time: "",
    reason: "",
    notes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof patientAppointment, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name as keyof patientAppointment]: undefined,
    }));
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, date, time: "" }));
    if (date && onGetSlots && doctor) {
      await onGetSlots(doctor.id, date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = appointmentSchema.safeParse({
      ...formData,
      doctorId: doctor?.id || formData.doctorId,
    });

    if (!validation.success) {
      const fieldErrors = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof patientAppointment, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(validation.data as patientAppointment);
    setFormData({
      doctorId: doctor?.id || "",
      date: "",
      time: "",
      reason: "",
      notes: "",
    });
  };

  return (
    <div className="appointment-booking-form">
      <h3>Book an Appointment</h3>
      {doctor && (
        <div className="selected-doctor">
          <p>
            <strong>Selected Doctor:</strong> Dr. {doctor.firstName}{" "}
            {doctor.lastName}
          </p>
          <p>
            <strong>Specialty:</strong> {doctor.specialty}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="date">Appointment Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            min={getLocalDate()}
            required
          />
          {errors.date && (
            <small style={{ color: "#d93025" }}>{errors.date}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="time">Time *</label>
          {!formData.date ? (
            <p>Select an appointment date to see available times.</p>
          ) : slotsLoading ? (
            <p role="status">Loading available times...</p>
          ) : slotsError ? (
            <p role="alert" className="error-message">
              {slotsError}
            </p>
          ) : availableSlots.length > 0 ? (
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, time: e.target.value }));
                setErrors((prev) => ({ ...prev, time: undefined }));
              }}
              required
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          ) : (
            <p>No appointment times are available on this date.</p>
          )}
          {errors.time && (
            <small style={{ color: "#d93025" }}>{errors.time}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Visit *</label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g., Regular checkup, Follow-up"
            required
          />
          {errors.reason && (
            <small style={{ color: "#d93025" }}>{errors.reason}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            loading ||
            slotsLoading ||
            !formData.date ||
            availableSlots.length === 0 ||
            Boolean(slotsError)
          }
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
};
