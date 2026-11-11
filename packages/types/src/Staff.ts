import type { ProfileDocument } from "./Common";

export type StaffStatus = "active" | "inactive" | "on_leave";

export interface Staff {
  id: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  avatar?: string;
  document?: ProfileDocument;
  employmentStatus: StaffStatus;
  isActive?: boolean;
  hireDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffDashboardStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  onLeaveStaff: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
