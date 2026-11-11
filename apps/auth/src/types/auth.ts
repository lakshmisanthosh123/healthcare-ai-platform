import type { ProfileDocument } from "@healthcare-platform/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  document?: ProfileDocument;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  fullName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordValues {
  email: string;
}

export interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
  email?: string;
  code?: string;
}

export interface OtpValues {
  code: string;
  email?: string;
}
