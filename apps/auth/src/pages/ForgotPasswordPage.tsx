import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@healthcare-platform/ui";
import { forgotPasswordSchema } from "@healthcare-platform/validation";
import { AuthLayout } from "../components/AuthLayout";
import { forgotPassword } from "../services/authService";
import type { ForgotPasswordValues } from "../types/auth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ForgotPasswordValues>({ email: "" });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");

    try {
      await forgotPassword(result.data);
      navigate("/otp", {
        state: {
          email: result.data.email,
          purpose: "forgot-password",
        },
      });
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Recover your login access securely."
    >
      <Card
        title="Reset your password"
        description="We will send guidance to the email on file."
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Email</span>
            <Input
              id="forgot-email"
              value={form.email}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, email: value }));
                if (error) setError("");
              }}
            />
            {error && <small style={{ color: "#d93025" }}>{error}</small>}
          </label>
          <Button label="Send otp " variant="primary" type="submit" />
        </form>
      </Card>
    </AuthLayout>
  );
}
