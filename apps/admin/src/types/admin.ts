import type { Doctor, Staff } from "@healthcare-platform/types";

export interface NewDoctorPayload extends Partial<Doctor> {
  password: string;
}

export interface NewStaffPayload extends Omit<Staff, "id"> {
  password: string;
}

export interface NewAdminUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "Active" | "Pending" | "Locked";
  lastLogin: string;
  department: string;
}

export interface AdminRole {
  id: string;
  name: string;
  scope: string;
  members: number;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  granted: boolean;
  description: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High";
}

export interface AdminSettings {
  enableMfa: boolean;
  retentionDays: number;
  notificationEmail: string;
  timezone: string;
}
