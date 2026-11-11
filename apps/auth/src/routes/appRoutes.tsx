import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { OtpPage } from "../pages/OtpPage";
import { ProfilePage } from "../pages/ProfilePage";
import { store } from "../store/store";

function ProtectedProfile() {
  return store.getState().auth.isAuthenticated ? (
    <ProfilePage />
  ) : (
    <Navigate to="/login" replace />
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/otp",
    element: <OtpPage />,
  },
  {
    path: "/profile",
    element: <ProtectedProfile />,
  },
  {
    path: "*",
    element: <h1>404 - Page Not Found</h1>,
  },
]);
