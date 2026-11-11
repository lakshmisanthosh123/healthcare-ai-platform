import { useState } from "react";
import { useAppointments, useDoctors } from "../hooks";
import {
  AppointmentCard,
  AppointmentBookingForm,
  DoctorCard,
} from "../components";
import { useTranslator } from "../hooks/useTranslator";
import "../styles/pages.css";

export const AppointmentPage = () => {
  const {
    appointments,
    upcomingAppointments,
    loading,
    error,
    bookAppointment,
    cancelAppointment,
    getAvailableSlots,
  } = useAppointments();
  const {
    doctors,
    selectedDoctor,
    setSelectedDoctor,
    searchDoctors,
    error: doctorsError,
  } = useDoctors();
  const t = useTranslator();
  const [activeTab, setActiveTab] = useState<"upcoming" | "book" | "past">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) await searchDoctors(searchQuery);
  };

  const handleBookAppointment = async (
    data: Parameters<typeof bookAppointment>[0],
  ) => {
    setBookingError("");
    try {
      await bookAppointment(data);
      setSuccessMessage(t("patient.bookingSuccess"));
      setActiveTab("upcoming");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (bookingError) {
      console.error("Booking failed:", bookingError);
      setBookingError(
        bookingError instanceof Error
          ? bookingError.message
          : "Could not book the appointment. Please try again.",
      );
    }
  };

  const handleGetSlots = async (doctorId: string, date: string) => {
    setAvailableSlots([]);
    setSlotsError("");
    setSlotsLoading(true);
    try {
      const slots = await getAvailableSlots(doctorId, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setSlotsError(
        error instanceof Error
          ? error.message
          : "Could not load appointment times. Please try again.",
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectDoctor = (doctor: (typeof doctors)[number]) => {
    setSelectedDoctor(doctor);
    setAvailableSlots([]);
    setSlotsError("");
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm(t("patient.cancelConfirm"))) return;
    try {
      await cancelAppointment(id);
      setSuccessMessage(t("patient.cancelled"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (cancelError) {
      console.error("Cancellation failed:", cancelError);
    }
  };

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const pastAppointments = appointments.filter(
    (appointment) => appointment.date < todayString,
  );

  return (
    <div className="appointment-page">
      <div className="page-header">
        <h1>{t("patient.appointmentsTitle")}</h1>
        <p>{t("patient.appointmentsDescription")}</p>
      </div>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 {t("patient.upcoming")} ({upcomingAppointments.length})
        </button>
        <button
          className={`tab ${activeTab === "book" ? "active" : ""}`}
          onClick={() => setActiveTab("book")}
        >
          ➕ {t("patient.bookNew")}
        </button>
        <button
          className={`tab ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          ✓ {t("patient.past")} ({pastAppointments.length})
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-message">{error}</div>}
        {activeTab === "book" && doctorsError && (
          <div className="error-message" role="alert">
            Could not load doctors: {doctorsError}
          </div>
        )}
        {activeTab === "upcoming" && (
          <div className="appointments-section">
            {loading ? (
              <div className="loading">{t("patient.loading")}</div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="appointments-grid">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t("patient.noUpcoming")}</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "book" && (
          <div className="book-appointment-section">
            {bookingError && (
              <div className="error-message" role="alert">
                {bookingError}
              </div>
            )}
            <div className="doctors-search">
              <form onSubmit={(event) => void handleSearch(event)}>
                <input
                  type="text"
                  placeholder={t("patient.searchDoctors")}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  {t("patient.search")}
                </button>
              </form>
            </div>
            {selectedDoctor ? (
              <div className="booking-form-section">
                <AppointmentBookingForm
                  doctor={selectedDoctor}
                  onSubmit={handleBookAppointment}
                  loading={loading}
                  availableSlots={availableSlots}
                  slotsLoading={slotsLoading}
                  slotsError={slotsError}
                  onGetSlots={handleGetSlots}
                />
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-secondary"
                >
                  {t("patient.selectDifferentDoctor")}
                </button>
              </div>
            ) : (
              <div className="doctors-grid">
                {loading ? (
                  <div className="loading">{t("patient.loading")}</div>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onSelect={handleSelectDoctor}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <p>{t("patient.noDoctors")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === "past" && (
          <div className="appointments-section">
            {pastAppointments.length > 0 ? (
              <div className="appointments-grid">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t("patient.noPast")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
