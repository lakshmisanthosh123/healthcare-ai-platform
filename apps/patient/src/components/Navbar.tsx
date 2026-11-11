import { NavLink, Outlet } from "react-router-dom";
import { AccountMenu, PortalShell } from "@healthcare-platform/ui";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { useTranslator } from "../hooks/useTranslator";
import { patientApi } from "../services/api";

export function Navbar() {
  const t = useTranslator();
  const account = getStoredAuthSession()?.user;

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("patientId");
    try {
      await patientApi.post("/auth/logout");
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
      brand="CareHub Patient"
      subtitle={t("patient.dashboard")}
      navigationLabel={t("patient.dashboard")}
      homeHref="/"
      navigation={
        <>
          <NavLink to="/">{t("patient.dashboard")}</NavLink>
          <NavLink to="/medical-history">{t("patient.medicalHistory")}</NavLink>
          <NavLink to="/prescriptions">{t("patient.prescriptions")}</NavLink>
          <NavLink to="/appointments">{t("patient.appointments")}</NavLink>
          <NavLink to="/profile">{t("patient.editProfile")}</NavLink>
        </>
      }
      actions={
        <AccountMenu
          userName={account?.name}
          email={account?.email}
          logoutLabel={t("patient.logout")}
          onLogout={() => void handleLogout()}
        />
      }
    >
      <Outlet />
    </PortalShell>
  );
}
