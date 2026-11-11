import { Card } from "@healthcare-platform/ui";
import { DashboardLayout } from "../components/DashboardLayout";
import { getMetrics } from "../services/dashboardService";
import { useDashboardQuery } from "../hooks/useDashboardQuery";

export function ChartsPage() {
  const { data: metrics, error, loading } = useDashboardQuery(getMetrics);

  return (
    <DashboardLayout
      title="Charts"
      description="Visualize operational health and patient flow."
    >
      <div className="dashboard-panel">
        <h3>Database-backed metrics</h3>
        {error && <p role="alert">{error}</p>}
        {loading && <p>Loading chart data...</p>}
        <div className="dashboard-grid">
          {(metrics ?? []).map((item) => (
            <Card key={item.title} title={item.title} description={item.detail}>
              <h3>{item.value}</h3>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
