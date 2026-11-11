import { AnalyticsReportPage } from "../components/AnalyticsReportPage";

export function AppointmentDashboardPage() {
  return (
    <AnalyticsReportPage
      title="Appointment Dashboard"
      description="Monitor appointment outcomes, demand, and booking patterns."
      makeCharts={(data) => [
        {
          title: "Appointment Status",
          description: "Appointments by current status",
          points: data.appointments.appointmentStatus,
          style: "horizontal",
        },
        {
          title: "No Show Analysis",
          description: "Completed appointments compared with no-shows",
          points: data.appointments.noShowAnalysis,
          style: "bar",
        },
        {
          title: "Appointment Trends",
          description: "Appointments by scheduled month, past 12 months",
          points: data.appointments.appointmentTrend,
          style: "area",
        },
        {
          title: "Peak Booking Hours",
          description: "Appointment counts by scheduled hour",
          points: data.appointments.peakBookingHours,
          style: "horizontal",
        },
      ]}
    />
  );
}
