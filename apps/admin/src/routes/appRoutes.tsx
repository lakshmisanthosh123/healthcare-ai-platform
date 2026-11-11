import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  getStoredAccessToken,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { Navbar } from "../components/Navbar";
import { UsersPage } from "../pages/UsersPage";
import { RolesPage } from "../pages/RolesPage";
import { PermissionsPage } from "../pages/PermissionsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { AuditLogsPage } from "../pages/AuditLogsPage";
import { ProfilePage } from "../pages/ProfilePage";

function ProtectedAdminRoute() {
  const role = getStoredAuthSession()?.user?.role?.toLowerCase();
  const hasToken = Boolean(getStoredAccessToken());
  const target =
    role === "doctor"
      ? (import.meta.env.VITE_DOCTOR_URL ?? "http://localhost:3004/")
      : role === "patient"
        ? (import.meta.env.VITE_PATIENT_URL ?? "http://localhost:3003/")
        : role === "staff"
          ? (import.meta.env.VITE_STAFF_URL ?? "http://localhost:3006/")
          : (import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login");

  useEffect(() => {
    if (!hasToken || role !== "admin") window.location.replace(target);
  }, [hasToken, role, target]);

  return hasToken && role === "admin" ? <Outlet /> : null;
}
function AdminLayout() {
  return <Navbar />;
}

export const appRouter = createBrowserRouter([
  {
    element: <ProtectedAdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/", element: <Navigate to="/users" replace /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/doctors", element: <UsersPage /> },
          { path: "/roles", element: <RolesPage /> },
          { path: "/permissions", element: <PermissionsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/audit-logs", element: <AuditLogsPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
