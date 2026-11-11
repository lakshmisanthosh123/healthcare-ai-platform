import type { ProfileDocument } from "./Common";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  bloodType?: string;
  address?: string;
  avatar?: string;
  document?: ProfileDocument;
  medicalHistory?: string;
  emergencyContacts?: Array<{
    id?: string;
    name: string;
    relationship?: string;
    phone?: string;
    email?: string;
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
