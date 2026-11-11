import { NavLink, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AccountMenu, PortalShell } from "@healthcare-platform/ui";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { useTranslator } from "../hooks/useTranslator";
import { staffApi } from "../services/api";

export function StaffLayout() {
  const t = useTranslator();
  const queryClient = useQueryClient();
  const account = getStoredAuthSession()?.user;

  const logout = async () => {
    try {
      await staffApi.post("/auth/logout");
    } catch (error) {
      console.error("Could not complete server logout.", error);
      window.alert(
        "The server could not confirm logout. Your local session was cleared.",
      );
    } finally {
      clearStoredAuthSession();
      queryClient.clear();
      window.location.assign(
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login",
      );
    }
  };

  return (
    <PortalShell
      brand={t("staff.brand")}
      subtitle={t("staff.platform")}
      navigationLabel={t("staff.navigation")}
      homeHref="/profile"
      navigation={<NavLink to="/profile">{t("staff.profile")}</NavLink>}
      contentClassName="staff-content"
      actions={
        <AccountMenu
          userName={account?.name}
          email={account?.email}
          logoutLabel={t("staff.logout")}
          onLogout={() => void logout()}
        />
      }
    >
      <Outlet />
    </PortalShell>
  );
}
