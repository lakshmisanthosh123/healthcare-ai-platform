import { useEffect, useState } from "react";
import { Card, PageHeader, Table } from "@healthcare-platform/ui";
import { getAdminPermissions } from "../services/adminService";
import { getAdminApiErrorMessage } from "../services/api";
import type { Permission } from "../types/admin";

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void getAdminPermissions()
      .then((result) => {
        if (active) setPermissions(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            getAdminApiErrorMessage(loadError, "Failed to load permissions."),
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
        title="Permissions"
        subtitle="Inspect entitlement coverage for clinical, operations, and governance workflows."
      />
      <div className="admin-content__body">
        {loading && <p role="status">Loading permissions...</p>}
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
          title="Access controls"
          description="Permission assignments and current status."
        >
          <Table
            columns={[
              { header: "Permission", key: "name" as keyof Permission },
              { header: "Category", key: "category" as keyof Permission },
              { header: "Granted", key: "granted" as keyof Permission },
              { header: "Description", key: "description" as keyof Permission },
            ]}
            data={loading || error ? [] : permissions}
          />
        </Card>
      </div>
    </section>
  );
}
