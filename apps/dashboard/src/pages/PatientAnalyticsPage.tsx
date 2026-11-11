import { AnalyticsReportPage } from "../components/AnalyticsReportPage";

export function PatientAnalyticsPage() {
  return (
    <AnalyticsReportPage
      title="Patient Analytics"
      description="Understand patient demographics and completed visit patterns."
      makeCharts={(data) => [
        {
          title: "Gender Distribution",
          description: "Patient profiles grouped by recorded gender",
          points: data.patients.genderDistribution,
          style: "horizontal",
        },
        {
          title: "Age Distribution",
          description: "Patient age groups based on date of birth",
          points: data.patients.ageDistribution,
          style: "horizontal",
        },
        {
          title: "New Patients",
          description: "First completed appointment by month, past 12 months",
          points: data.patients.newPatients,
          style: "line",
        },
        {
          title: "Returning Patients",
          description: "Patients with a prior completed visit, by month",
          points: data.patients.returningPatients,
          style: "area",
        },
      ]}
    />
  );
}
