import { Card } from "@healthcare-platform/ui";
import { DashboardLayout } from "../components/DashboardLayout";
import { getReports } from "../services/dashboardService";
import { useDashboardQuery } from "../hooks/useDashboardQuery";

export function ReportsPage() {
  const { data: reports, error, loading } = useDashboardQuery(getReports);

  return (
    <DashboardLayout
      title="Reports"
      description="Access operational and clinical reports."
    >
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading reports...</p>}
      <div className="dashboard-list">
        {(reports ?? []).map((report) => (
          <Card
            key={report.id}
            title={report.title}
            description={`Owner: ${report.owner}`}
          >
            <p>Status: {report.status}</p>
          </Card>
        ))}
      </div>
      {!loading && !error && reports?.length === 0 && (
        <p>No reports are available.</p>
      )}
    </DashboardLayout>
  );
}
