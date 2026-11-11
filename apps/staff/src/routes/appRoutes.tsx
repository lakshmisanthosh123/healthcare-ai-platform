import { createBrowserRouter, Navigate } from "react-router-dom";
import { StaffLayout } from "../components/StaffLayout";
import { ProtectedStaffRoute } from "./ProtectedStaffRoute";
import { StaffProfilePage } from "../pages/StaffProfilePage";

export const appRouter = createBrowserRouter([
  {
    element: <ProtectedStaffRoute />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/profile" replace />,
          },
          {
            path: "/profile",
            element: <StaffProfilePage />,
          },
          {
            path: "*",
            element: <Navigate to="/profile" replace />,
          },
        ],
      },
    ],
  },
]);
