import { Card } from "@healthcare-platform/ui";
import { DashboardLayout } from "../components/DashboardLayout";
import { getNotifications } from "../services/dashboardService";
import { useDashboardQuery } from "../hooks/useDashboardQuery";

export function NotificationsPage() {
  const {
    data: notifications,
    error,
    loading,
  } = useDashboardQuery(getNotifications);

  return (
    <DashboardLayout
      title="Notifications"
      description="Review alerts and operational updates."
    >
      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading notifications...</p>}
      <div className="dashboard-list">
        {(notifications ?? []).map((notification) => (
          <Card
            key={notification.id}
            title={notification.title}
            description={notification.time}
          >
            <p>{notification.detail}</p>
          </Card>
        ))}
      </div>
      {!loading && !error && notifications?.length === 0 && (
        <p>No notifications are available.</p>
      )}
    </DashboardLayout>
  );
}
