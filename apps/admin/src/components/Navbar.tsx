import { NavLink, Outlet } from "react-router-dom";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { AccountMenu, PortalShell } from "@healthcare-platform/ui";
import { useTranslator } from "../hooks/useTranslator";
import { adminApi } from "../services/api";

export function Navbar() {
  const t = useTranslator();
  const account = getStoredAuthSession()?.user;

  const logout = async () => {
    try {
      await adminApi.post("/auth/logout");
    } catch (error) {
      console.error("Could not complete server logout.", error);
      window.alert(
        "The server could not confirm logout. Your local session was cleared.",
      );
    } finally {
      clearStoredAuthSession();
      window.location.assign(
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login",
      );
    }
  };

  return (
    <PortalShell
      brand={t("admin.brand")}
      subtitle={t("admin.controlCenter")}
      navigationLabel={t("admin.sections")}
      homeHref="/users"
      navigation={
        <>
          <a href="/dashboard">Dashboard</a>
          <NavLink to="/users">{t("admin.users")}</NavLink>
          <NavLink to="/roles">{t("admin.roles")}</NavLink>
          <NavLink to="/permissions">{t("admin.permissions")}</NavLink>
          <NavLink to="/settings">{t("admin.settings")}</NavLink>
          <NavLink to="/audit-logs">{t("admin.auditLogs")}</NavLink>
        </>
      }
      actions={
        <AccountMenu
          userName={account?.name}
          email={account?.email}
          logoutLabel={t("admin.logout")}
          onLogout={() => void logout()}
        />
      }
      contentClassName="admin-content"
    >
      <Outlet />
    </PortalShell>
  );
}
