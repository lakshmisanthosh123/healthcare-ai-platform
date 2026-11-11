import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, Input } from "@healthcare-platform/ui";
import { resetPasswordSchema } from "@healthcare-platform/validation";
import { AuthLayout } from "../components/AuthLayout";
import { resetPassword } from "../services/authService";
import type { ResetPasswordValues } from "../types/auth";

export function ResetPasswordPage() {
  const location = useLocation();
  const [form, setForm] = useState<ResetPasswordValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordValues, string>>
  >({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = resetPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof ResetPasswordValues, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await resetPassword({
      ...result.data,
      email: location.state?.email,
      code: location.state?.code,
    });
  };

  return (
    <AuthLayout
      title="Reset Password"
      description="Choose a new password for your account."
    >
      <Card
        title="Set a new password"
        description="Create a strong password to protect your profile."
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>New password</span>
            <Input
              id="reset-password"
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
          <label>
            <span>Confirm password</span>
            <Input
              id="reset-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, confirmPassword: value }));
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
            />
            {errors.confirmPassword && (
              <small style={{ color: "#d93025" }}>
                {errors.confirmPassword}
              </small>
            )}
          </label>
          <Button label="Update password" variant="primary" type="submit" />
        </form>
      </Card>
    </AuthLayout>
  );
}
