import { Link } from "react-router-dom";
import { Card } from "@healthcare-platform/ui";
import { useStaffDashboardStats } from "../hooks/useStaffQueries";
import { getApiErrorMessage } from "../services/api";
import { useTranslator } from "../hooks/useTranslator";

export function StaffDashboardPage() {
  const t = useTranslator();
  const stats = useStaffDashboardStats();

  return (
    <section className="staff-page">
      <header className="staff-page-heading">
        <div>
          <p className="staff-eyebrow">{t("staff.brand")}</p>
          <h1>{t("staff.welcome")}</h1>
          <p>{t("staff.dashboardDescription")}</p>
        </div>
      </header>

      {stats.isPending ? (
        <p className="staff-state" role="status">
          {t("staff.loading")}
        </p>
      ) : stats.isError ? (
        <div className="staff-alert staff-alert--error" role="alert">
          {getApiErrorMessage(stats.error, t("staff.loadError"))}
          <button type="button" onClick={() => void stats.refetch()}>
            {t("staff.retry")}
          </button>
        </div>
      ) : (
        <div className="staff-stats-grid">
          <StatCard
            label={t("staff.totalStaff")}
            value={stats.data.totalStaff}
          />
          <StatCard
            label={t("staff.activeStaff")}
            value={stats.data.activeStaff}
          />
          <StatCard
            label={t("staff.inactiveStaff")}
            value={stats.data.inactiveStaff}
          />
          <StatCard
            label={t("staff.onLeaveStaff")}
            value={stats.data.onLeaveStaff}
          />
        </div>
      )}

      <Card
        title={t("staff.quickLinks")}
        description={t("staff.directoryDescription")}
        className="staff-quick-links"
      >
        <Link className="staff-quick-link" to="/staff">
          {t("staff.manageStaff")}
        </Link>
        <Link className="staff-quick-link" to="/profile">
          {t("staff.profile")}
        </Link>
      </Card>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="staff-stat-card">
      <p>{label}</p>
      <strong>{value.toLocaleString()}</strong>
    </Card>
  );
}
