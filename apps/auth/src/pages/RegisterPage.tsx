import { useState } from "react";
import { Button, Card, Input } from "@healthcare-platform/ui";
import { registerSchema } from "@healthcare-platform/validation";
import { AuthLayout } from "../components/AuthLayout";
import { register, useAuth } from "../context/AuthContext";
import { useAppDispatch } from "../store/hooks";
import type { RegisterFormValues } from "../types/auth";

const initialForm: RegisterFormValues = {
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  bloodType: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAuth();
  const [form, setForm] = useState<RegisterFormValues>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [registrationError, setRegistrationError] = useState("");

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
    };

    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof RegisterFormValues, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setRegistrationError("");
    try {
      await dispatch(register(result.data)).unwrap();
      window.location.assign(
        import.meta.env.VITE_SHELL_URL ?? `${window.location.origin}/`,
      );
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof error.message === "string"
              ? error.message
              : "Registration failed";
      setRegistrationError(message);
    }
  };

  return (
    <AuthLayout
      title="Register"
      description="Patient accounts can be created here. Staff and doctor accounts are provided by your administrator."
    >
      <Card
        title="Create your account"
        description="Create a patient account to join the CareHub platform."
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <label>
              <span>First name</span>
              <Input
                id="register-first-name"
                value={form.firstName}
                onChange={(value) => handleChange("firstName", value)}
              />
              {errors.firstName && (
                <small style={{ color: "#d93025" }}>{errors.firstName}</small>
              )}
            </label>
            <label>
              <span>Last name</span>
              <Input
                id="register-last-name"
                value={form.lastName}
                onChange={(value) => handleChange("lastName", value)}
              />
              {errors.lastName && (
                <small style={{ color: "#d93025" }}>{errors.lastName}</small>
              )}
            </label>
          </div>

          <label>
            <span>Email</span>
            <Input
              id="register-email"
              value={form.email}
              onChange={(value) => handleChange("email", value)}
            />
            {errors.email && (
              <small style={{ color: "#d93025" }}>{errors.email}</small>
            )}
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <label>
              <span>Phone</span>
              <Input
                id="register-phone"
                value={form.phone}
                onChange={(value) => handleChange("phone", value)}
              />
              {errors.phone && (
                <small style={{ color: "#d93025" }}>{errors.phone}</small>
              )}
            </label>
            <label>
              <span>Date of birth</span>
              <Input
                id="register-date-of-birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(value) => handleChange("dateOfBirth", value)}
              />
              {errors.dateOfBirth && (
                <small style={{ color: "#d93025" }}>{errors.dateOfBirth}</small>
              )}
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <label>
              <span>Gender</span>
              <select
                id="register-gender"
                value={form.gender}
                onChange={(event) => handleChange("gender", event.target.value)}
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #dfe3eb",
                }}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <small style={{ color: "#d93025" }}>{errors.gender}</small>
              )}
            </label>
            <label>
              <span>Blood type</span>
              <select
                id="register-blood-type"
                value={form.bloodType}
                onChange={(event) =>
                  handleChange("bloodType", event.target.value)
                }
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #dfe3eb",
                }}
              >
                <option value="">Select blood type</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              {errors.bloodType && (
                <small style={{ color: "#d93025" }}>{errors.bloodType}</small>
              )}
            </label>
          </div>

          <label>
            <span>Address</span>
            <Input
              id="register-address"
              value={form.address}
              onChange={(value) => handleChange("address", value)}
            />
            {errors.address && (
              <small style={{ color: "#d93025" }}>{errors.address}</small>
            )}
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <label>
              <span>Password</span>
              <Input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(value) => handleChange("password", value)}
              />
              {errors.password && (
                <small style={{ color: "#d93025" }}>{errors.password}</small>
              )}
            </label>
            <label>
              <span>Confirm password</span>
              <Input
                id="register-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(value) => handleChange("confirmPassword", value)}
              />
              {errors.confirmPassword && (
                <small style={{ color: "#d93025" }}>
                  {errors.confirmPassword}
                </small>
              )}
            </label>
          </div>

          <Button
            label="Create account"
            variant="primary"
            type="submit"
            disabled={loading}
          />
          {loading && <small>Creating account...</small>}
          {registrationError && (
            <small style={{ color: "#d93025" }}>{registrationError}</small>
          )}
        </form>
      </Card>
    </AuthLayout>
  );
}
