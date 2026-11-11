import { DashboardChart } from "../components/DashboardChart";
import { DashboardLayout } from "../components/DashboardLayout";
import { PowerBIReport } from "../components/PowerBIReport";
import { getAnalytics } from "../services/dashboardService";
import { useDashboardQuery } from "../hooks/useDashboardQuery";
import "./OverviewPage.css";

export function OverviewPage() {
  const { data, error, loading } = useDashboardQuery(getAnalytics);
  const executive = data?.executive;

  return (
    <DashboardLayout
      title="Executive Dashboard"
      description="A high-level view of patient care, appointments, and invoiced revenue."
    >
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading dashboard data...</p>}
      <PowerBIReport />
      {executive && (
        <>
          <section
            className="overview-kpis"
            aria-label="Key performance indicators"
          >
            {executive.kpis.map((item) => (
              <article className="overview-kpi" key={item.title}>
                <h2>{item.title}</h2>
                <p className="overview-kpi__value">
                  {item.title === "Revenue"
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(item.value)
                    : item.value.toLocaleString()}
                </p>
                <p className="overview-kpi__detail">{item.detail}</p>
              </article>
            ))}
          </section>
          <section
            className="overview-charts"
            aria-label="Healthcare analytics charts"
          >
            <DashboardChart
              title="Monthly Revenue"
              description="Invoice totals by month, past 12 months"
              points={executive.monthlyRevenue}
              style="bar"
              format="currency"
            />
            <DashboardChart
              title="Monthly Appointments"
              description="Appointments by scheduled month, past 12 months"
              points={executive.monthlyAppointments}
              style="area"
            />
            <DashboardChart
              title="Patient Growth"
              description="Patient registrations by month, past 12 months"
              points={executive.patientGrowth}
              style="line"
            />
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
