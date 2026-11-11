import { api } from "./api";
import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordValues,
  ResetPasswordValues,
  OtpValues,
  AuthUser,
} from "../types/auth";

export async function login(payload: LoginFormValues) {
  return (await api.post("/auth/login", payload)).data;
}

interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function register(
  payload: RegisterFormValues,
): Promise<RegisterResponse> {
  return (
    await api.post<RegisterResponse>("/auth/register", {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      password: payload.password,
      role: "patient",
      phone: payload.phone.trim(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      bloodType: payload.bloodType,
      address: payload.address.trim(),
    })
  ).data;
}

export async function forgotPassword(
  payload: ForgotPasswordValues,
): Promise<{ sent: boolean }> {
  return (await api.post<{ sent: boolean }>("/auth/forgot-password", payload))
    .data;
}

export async function resetPassword(
  payload: ResetPasswordValues,
): Promise<{ reset: boolean }> {
  return (await api.post<{ reset: boolean }>("/auth/reset-password", payload))
    .data;
}

export async function verifyOtp(
  payload: OtpValues,
): Promise<{ verified: boolean }> {
  return (await api.post<{ verified: boolean }>("/auth/verify-otp", payload))
    .data;
}

export async function getCurrentProfile(): Promise<AuthUser> {
  return (await api.get<AuthUser>("/auth/me")).data;
}

export async function updateCurrentProfile(
  payload: Partial<AuthUser>,
): Promise<AuthUser> {
  return (await api.put<AuthUser>("/auth/me", payload)).data;
}

export async function resendOtp(email: string): Promise<{ sent: boolean }> {
  return (await api.post<{ sent: boolean }>("/auth/resend-otp", { email }))
    .data;
}

export async function logout(): Promise<{ success: boolean }> {
  return (await api.post<{ success: boolean }>("/auth/logout")).data;
}
