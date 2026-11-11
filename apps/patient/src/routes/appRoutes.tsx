import { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  getStoredAccessToken,
  getStoredAuthSession,
} from "@healthcare-platform/utils";
import { Navbar } from "../components/Navbar";
import {
  DashboardPage,
  PatientDetailsPage,
  MedicalHistoryPage,
  PrescriptionPage,
  AppointmentPage,
} from "../pages";

function ProtectedPatientRoute() {
  const role = getStoredAuthSession()?.user?.role?.toLowerCase();
  const hasToken = Boolean(getStoredAccessToken());
  const target =
    role === "admin"
      ? (import.meta.env.VITE_ADMIN_URL ?? "http://localhost:3005/")
      : role === "doctor"
        ? (import.meta.env.VITE_DOCTOR_URL ?? "http://localhost:3004/")
        : role === "staff"
          ? (import.meta.env.VITE_STAFF_URL ?? "http://localhost:3006/")
          : (import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login");

  useEffect(() => {
    if (!hasToken || role !== "patient") window.location.replace(target);
  }, [hasToken, role, target]);

  return hasToken && role === "patient" ? <Outlet /> : null;
}

function PatientLayout() {
  return <Navbar />;
}

export const appRouter = createBrowserRouter([
  {
    element: <ProtectedPatientRoute />,
    children: [
      {
        element: <PatientLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/patient", element: <PatientDetailsPage /> },
          { path: "/profile", element: <PatientDetailsPage /> },
          { path: "/medical-history", element: <MedicalHistoryPage /> },
          { path: "/prescriptions", element: <PrescriptionPage /> },
          { path: "/appointments", element: <AppointmentPage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
