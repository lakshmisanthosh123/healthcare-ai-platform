import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, Input } from "@healthcare-platform/ui";
import { otpSchema } from "@healthcare-platform/validation";
import { AuthLayout } from "../components/AuthLayout";
import { verifyOtp } from "../services/authService";
import type { OtpValues } from "../types/auth";

export function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<OtpValues>({ code: "" });
  const [error, setError] = useState<string>("");
  const email = location.state?.email;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = otpSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");

    try {
      await verifyOtp({ ...result.data, email });
      navigate("/reset-password", {
        state: {
          email,
          code: result.data.code,
        },
      });
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  return (
    <AuthLayout
      title="OTP Verification"
      description="Confirm the one-time code to continue."
    >
      <Card
        title="Verify your code"
        description="Enter the 6-digit code from your authenticator or email."
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Verification code</span>
            <Input
              id="otp-code"
              value={form.code}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, code: value }));
                if (error) setError("");
              }}
            />
            {error && <small style={{ color: "#d93025" }}>{error}</small>}
          </label>
          <Button label="Verify code" variant="primary" type="submit" />
        </form>
      </Card>
    </AuthLayout>
  );
}
