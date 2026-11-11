import { useEffect, useState } from "react";
import { Card, PageHeader, Table } from "@healthcare-platform/ui";
import { getAdminRoles } from "../services/adminService";
import { getAdminApiErrorMessage } from "../services/api";
import type { AdminRole } from "../types/admin";

export function RolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void getAdminRoles()
      .then((result) => {
        if (active) setRoles(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getAdminApiErrorMessage(loadError, "Failed to load roles."));
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
        title="Roles"
        subtitle="Review the role model and scope coverage for the organization."
      />
      <div className="admin-content__body">
        {loading && <p role="status">Loading roles...</p>}
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
          title="Role matrix"
          description="Current role assignments and membership."
        >
          <Table
            columns={[
              { header: "Name", key: "name" as keyof AdminRole },
              { header: "Scope", key: "scope" as keyof AdminRole },
              { header: "Members", key: "members" as keyof AdminRole },
              { header: "Description", key: "description" as keyof AdminRole },
            ]}
            data={loading || error ? [] : roles}
          />
        </Card>
      </div>
    </section>
  );
}
