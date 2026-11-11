import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "@healthcare-platform/ui";
import { getRoleHomePath } from "@healthcare-platform/utils";
import { loginSchema } from "@healthcare-platform/validation";
import { AuthLayout } from "../components/AuthLayout";
import { login, useAuth } from "../context/AuthContext";
import { useAppDispatch } from "../store/hooks";
import type { LoginFormValues } from "../types/auth";
import { useTranslator } from "../hooks/useTranslator";

const initialForm: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginPage() {
  const t = useTranslator();
  const dispatch = useAppDispatch();
  const { loading, error } = useAuth();
  const [form, setForm] = useState<LoginFormValues>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof LoginFormValues, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoginError("");

    try {
      const session = await dispatch(login(result.data)).unwrap();
      const modulePath = getRoleHomePath(session.user?.role);
      if (!modulePath) {
        setLoginError("Your account does not have a supported role.");
        return;
      }

      const shellUrl =
        import.meta.env.VITE_SHELL_URL ?? "http://localhost:3000/";
      window.location.assign(new URL(modulePath, shellUrl).toString());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Login failed";
      setLoginError(message);
    }
  };

  return (
    <AuthLayout title={t("login.welcome")} description={t("login.description")}>
      <Card title={t("login.title")} description={t("login.title")}>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>{t("login.email")}</span>
            <Input
              id="login-email"
              value={form.email}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, email: value }));
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
            {errors.email && (
              <small style={{ color: "#d93025" }}>{errors.email}</small>
            )}
          </label>
          <label>
            <span>{t("login.password")}</span>
            <Input
              id="login-password"
              type="password"
              value={form.password}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, password: value }));
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            {errors.password && (
              <small style={{ color: "#d93025" }}>{errors.password}</small>
            )}
          </label>
          <div className="auth-form__forgot">
            <Link to="/forgot-password">{t("login.forgotPassword")}</Link>
          </div>

          <Button
            label={t("login.submit")}
            variant="primary"
            type="submit"
            disabled={loading}
          />
          {(loginError || error) && (
            <small style={{ color: "#d93025" }}>{loginError || error}</small>
          )}

          <div className="auth-form__register">
            <span>{t("login.noAccount")}</span>{" "}
            <Link to="/register">{t("login.createAccount")}</Link>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
