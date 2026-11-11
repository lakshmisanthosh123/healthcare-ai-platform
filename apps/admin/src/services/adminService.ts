import type { Doctor, Patient, Staff } from "@healthcare-platform/types";
import type { ProfileDocument } from "@healthcare-platform/types";
import { adminApi } from "./api";
import type {
  AdminRole,
  AdminSettings,
  AdminUser,
  AuditLog,
  NewDoctorPayload,
  NewStaffPayload,
  Permission,
} from "../types/admin";

export const getAdminUsers = async () =>
  (await adminApi.get<AdminUser[]>("/admin/users")).data;
export const deleteAdminUser = async (id: string) =>
  (await adminApi.delete(`/admin/users/${id}`)).data;
export const getAdminPatients = async () =>
  (await adminApi.get<Patient[]>("/admin/patients")).data;
export const getAdminDoctors = async () =>
  (await adminApi.get<Doctor[]>("/admin/doctors")).data;
export const createDoctor = async (payload: NewDoctorPayload) =>
  (await adminApi.post<Doctor>("/admin/doctors", payload)).data;
export const getAdminStaff = async () =>
  (await adminApi.get<Staff[]>("/staff")).data;
export const createStaff = async (payload: NewStaffPayload) =>
  (await adminApi.post<Staff>("/staff", payload)).data;
export const updateAdminStaff = async (id: string, payload: Partial<Staff>) =>
  (await adminApi.put<Staff>(`/staff/${encodeURIComponent(id)}`, payload)).data;
export const deleteAdminStaff = async (id: string) =>
  (await adminApi.delete(`/staff/${encodeURIComponent(id)}`)).data;
export const updateDoctor = async (id: string, payload: Partial<Doctor>) =>
  (await adminApi.put<Doctor>(`/admin/doctors/${id}`, payload)).data;
export const deleteDoctor = async (id: string) =>
  (await adminApi.delete(`/admin/doctors/${id}`)).data;
export const getAdminRoles = async () =>
  (await adminApi.get<AdminRole[]>("/admin/roles")).data;
export const getAdminPermissions = async () =>
  (await adminApi.get<Permission[]>("/admin/permissions")).data;
export const getAdminSettings = async () =>
  (await adminApi.get<AdminSettings>("/admin/settings")).data;
export const updateAdminSettings = async (payload: AdminSettings) =>
  (await adminApi.put<AdminSettings>("/admin/settings", payload)).data;
export const updateAdminProfile = async (payload: {
  name: string;
  email: string;
  avatar?: string;
  document?: ProfileDocument;
}) => (await adminApi.put("/auth/me", payload)).data;
export const getAuditLogs = async () =>
  (await adminApi.get<AuditLog[]>("/admin/audit-logs")).data;
