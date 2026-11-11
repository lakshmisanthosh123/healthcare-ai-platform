import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { AccountMenu, PageHeader, PortalShell } from "@healthcare-platform/ui";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { useTranslator } from "../hooks/useTranslator";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardLayout({
  title,
  description,
  children,
}: DashboardLayoutProps) {
  const t = useTranslator();
  const account = getStoredAuthSession()?.user;

  const logout = () => {
    clearStoredAuthSession();
    window.location.assign(
      import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login",
    );
  };

  return (
    <PortalShell
      brand="CareHub Dashboard"
      subtitle="Operations"
      navigationLabel="Dashboard sections"
      homeHref="/dashboard"
      navigation={
        <>
          <NavLink to="/dashboard" end>
            Executive Dashboard
          </NavLink>
          <NavLink to="/dashboard/doctors">Doctor Analytics</NavLink>
          <NavLink to="/dashboard/patients">Patient Analytics</NavLink>
          <NavLink to="/dashboard/revenue">Revenue Dashboard</NavLink>
          <NavLink to="/dashboard/appointments">Appointment Dashboard</NavLink>
          <a href="/users">User management</a>
        </>
      }
      actions={
        <AccountMenu
          userName={account?.name}
          email={account?.email}
          logoutLabel={t("admin.logout")}
          onLogout={logout}
        />
      }
    >
      <PageHeader title={title} subtitle={description} />
      <div className="dashboard-shell__body">{children}</div>
    </PortalShell>
  );
}
