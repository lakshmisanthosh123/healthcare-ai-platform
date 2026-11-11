import { useEffect, useState } from "react";
import { Card, PageHeader, Table } from "@healthcare-platform/ui";
import { getAuditLogs } from "../services/adminService";
import { getAdminApiErrorMessage } from "../services/api";
import type { AuditLog } from "../types/admin";

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void getAuditLogs()
      .then((result) => {
        if (active) setLogs(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            getAdminApiErrorMessage(loadError, "Failed to load audit logs."),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Audit Logs"
        subtitle="Review administrative changes and security events."
      />
      <div className="admin-content__body">
        {loading && <p role="status">Loading audit logs...</p>}
        {error && (
          <p role="alert">
            {error}{" "}
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
            >
              Retry
            </button>
          </p>
        )}
        <Card
          title="Recent activity"
          description="Latest changes across the admin environment."
        >
          <Table
            columns={[
              { header: "Actor", key: "actor" as keyof AuditLog },
              { header: "Action", key: "action" as keyof AuditLog },
              { header: "Target", key: "target" as keyof AuditLog },
              { header: "Severity", key: "severity" as keyof AuditLog },
            ]}
            data={loading || error ? [] : logs}
          />
        </Card>
      </div>
    </section>
  );
}
