import { createBrowserRouter, Navigate } from "react-router-dom";
import { OverviewPage } from "../pages/OverviewPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { ChartsPage } from "../pages/ChartsPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { DoctorAnalyticsPage } from "../pages/DoctorAnalyticsPage";
import { PatientAnalyticsPage } from "../pages/PatientAnalyticsPage";
import { RevenueDashboardPage } from "../pages/RevenueDashboardPage";
import { AppointmentDashboardPage } from "../pages/AppointmentDashboardPage";

export const appRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <OverviewPage /> },
  { path: "/dashboard/doctors", element: <DoctorAnalyticsPage /> },
  { path: "/dashboard/patients", element: <PatientAnalyticsPage /> },
  { path: "/dashboard/revenue", element: <RevenueDashboardPage /> },
  { path: "/dashboard/appointments", element: <AppointmentDashboardPage /> },
  { path: "/analytics", element: <AnalyticsPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/charts", element: <ChartsPage /> },
  { path: "/notifications", element: <NotificationsPage /> },
]);
