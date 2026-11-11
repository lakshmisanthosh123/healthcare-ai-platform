import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  getStoredAccessToken,
  getStoredAuthSession,
} from "@healthcare-platform/utils";

function moduleUrlForRole(role: string): string {
  if (role === "admin") {
    return import.meta.env.VITE_ADMIN_URL ?? "http://localhost:3005/";
  }
  if (role === "doctor") {
    return import.meta.env.VITE_DOCTOR_URL ?? "http://localhost:3004/";
  }
  if (role === "patient") {
    return import.meta.env.VITE_PATIENT_URL ?? "http://localhost:3003/";
  }
  if (role === "staff") {
    return import.meta.env.VITE_STAFF_URL ?? "http://localhost:3006/";
  }
  return import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login";
}

export function ProtectedStaffRoute() {
  const session = getStoredAuthSession();
  const role = session?.user?.role?.toLowerCase() ?? null;
  const hasToken = Boolean(getStoredAccessToken());
  const isAllowedRole = role === "staff";

  useEffect(() => {
    if (!hasToken || !role) {
      window.location.replace(
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login",
      );
      return;
    }
    if (!isAllowedRole) {
      window.location.replace(moduleUrlForRole(role));
    }
  }, [hasToken, isAllowedRole, role]);

  if (!hasToken || !isAllowedRole) {
    return null;
  }

  return <Outlet />;
}
