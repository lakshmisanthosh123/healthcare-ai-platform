import { AnalyticsReportPage } from "../components/AnalyticsReportPage";

export function DoctorAnalyticsPage() {
  return (
    <AnalyticsReportPage
      title="Doctor Analytics"
      description="Compare patient volume, patient ratings, invoiced revenue, and appointment status."
      makeCharts={(data) => [
        {
          title: "Patients per Doctor",
          description: "Unique patients with an appointment, all time",
          points: data.doctors.patientsPerDoctor,
          style: "horizontal",
        },
        {
          title: "Doctor Rating",
          description: "Average patient rating from 1 to 5",
          points: data.doctors.doctorRating,
          style: "horizontal",
          format: "rating",
          scaleMax: 5,
        },
        {
          title: "Revenue per Doctor",
          description: "Total invoiced amount by doctor",
          points: data.doctors.revenuePerDoctor,
          style: "horizontal",
          format: "currency",
        },
        {
          title: "Appointment Status",
          description: "Appointments by current status",
          points: data.doctors.appointmentStatus,
          style: "bar",
        },
      ]}
    />
  );
}
