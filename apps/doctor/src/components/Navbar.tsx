import { NavLink, Outlet } from "react-router-dom";
import { AccountMenu, PortalShell } from "@healthcare-platform/ui";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { useTranslator } from "../hooks/useTranslator";
import { doctorApi } from "../services/api";

export function Navbar() {
  const t = useTranslator();
  const account = getStoredAuthSession()?.user;

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("doctorId");
    try {
      await doctorApi.post("/auth/logout");
    } catch (error) {
      console.error("Could not complete server logout.", error);
      window.alert(
        "The server could not confirm logout. Your local session was cleared.",
      );
    } finally {
      clearStoredAuthSession();
      window.location.href =
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login";
    }
  };

  return (
    <PortalShell
      brand="CareHub Doctor"
      subtitle={t("doctor.dashboard")}
      navigationLabel={t("doctor.dashboard")}
      homeHref="/"
      navigation={
        <>
          <NavLink to="/">{t("doctor.dashboard")}</NavLink>
          <NavLink to="/doctors">{t("doctor.doctors")}</NavLink>
          <NavLink to="/patients">{t("doctor.patients")}</NavLink>
          <NavLink to="/appointments">{t("doctor.schedule")}</NavLink>
          <NavLink to="/prescriptions">{t("doctor.prescriptions")}</NavLink>
          <NavLink to="/profile">{t("doctor.editProfile")}</NavLink>
        </>
      }
      actions={
        <AccountMenu
          userName={account?.name}
          email={account?.email}
          logoutLabel={t("doctor.logout")}
          onLogout={() => void handleLogout()}
        />
      }
    >
      <Outlet />
    </PortalShell>
  );
}
