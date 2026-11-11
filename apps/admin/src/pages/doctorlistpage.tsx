import { useEffect, useState } from "react";
import { Button, PageHeader, Table } from "@healthcare-platform/ui";
import { getAdminUsers } from "../services/adminService";
import type { AdminUser } from "../types/admin";

export function doctorlistPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    void getAdminUsers().then(setUsers);
  }, []);

  return (
    <section className="admin-page">
      <PageHeader
        title="doctor"
        subtitle="Manage clinician and administrator access across the platform."
        actions={<Button label="Invite user" variant="primary" />}
      />
      <div className="admin-content__body">
        <div className="admin-page-grid">
          <div className="admin-page-card">
            <Table
              columns={[
                { header: "User", key: "username" as keyof AdminUser },
                { header: "Email", key: "email" as keyof AdminUser },
                { header: "Role", key: "role" as keyof AdminUser },
                { header: "Status", key: "status" as keyof AdminUser },
              ]}
              data={users}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
