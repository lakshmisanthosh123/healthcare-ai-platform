import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  getStoredAccessToken,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { Navbar } from "../components/Navbar";
import {
  DashboardPage,
  DoctorListPage,
  PatientsListPage,
  SchedulePage,
  PrescriptionPage,
  ProfilePage,
} from "../pages";

function ProtectedDoctorRoute() {
  const role = getStoredAuthSession()?.user?.role?.toLowerCase();
  const hasToken = Boolean(getStoredAccessToken());
  const target =
    role === "admin"
      ? (import.meta.env.VITE_ADMIN_URL ?? "http://localhost:3005/")
      : role === "patient"
        ? (import.meta.env.VITE_PATIENT_URL ?? "http://localhost:3003/")
        : role === "staff"
          ? (import.meta.env.VITE_STAFF_URL ?? "http://localhost:3006/")
          : (import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login");

  useEffect(() => {
    if (!hasToken || role !== "doctor") window.location.replace(target);
  }, [hasToken, role, target]);

  return hasToken && role === "doctor" ? <Outlet /> : null;
}

function DoctorLayout() {
  return <Navbar />;
}

export const appRouter = createBrowserRouter([
  {
    element: <ProtectedDoctorRoute />,
    children: [
      {
        element: <DoctorLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/doctors", element: <DoctorListPage /> },
          { path: "/patients", element: <PatientsListPage /> },
          { path: "/appointments", element: <SchedulePage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/prescriptions", element: <PrescriptionPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
