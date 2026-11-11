import { DashboardChart, type DashboardChartStyle } from "./DashboardChart";
import { DashboardLayout } from "./DashboardLayout";
import { useDashboardQuery } from "../hooks/useDashboardQuery";
import { getAnalytics } from "../services/dashboardService";
import type { AnalyticsSeries, DashboardAnalytics } from "../types/dashboard";
import "../pages/OverviewPage.css";

export interface AnalyticsChartDefinition {
  title: string;
  description: string;
  points: AnalyticsSeries[];
  style: DashboardChartStyle;
  format?: "number" | "currency" | "rating";
  scaleMax?: number;
}

interface AnalyticsReportPageProps {
  title: string;
  description: string;
  makeCharts: (data: DashboardAnalytics) => AnalyticsChartDefinition[];
}

export function AnalyticsReportPage({
  title,
  description,
  makeCharts,
}: AnalyticsReportPageProps) {
  const { data, error, loading } = useDashboardQuery(getAnalytics);

  return (
    <DashboardLayout title={title} description={description}>
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading analytics...</p>}
      {data && (
        <section className="overview-charts" aria-label={`${title} charts`}>
          {makeCharts(data).map((chart) => (
            <DashboardChart key={chart.title} {...chart} />
          ))}
        </section>
      )}
    </DashboardLayout>
  );
}
