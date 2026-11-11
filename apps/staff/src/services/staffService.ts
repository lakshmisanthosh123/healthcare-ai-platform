import type { Staff } from "@healthcare-platform/types";
import type { StaffFormValues } from "@healthcare-platform/validation";
import { staffApi, unwrapResponse } from "./api";

export interface StaffFilters {
  search?: string;
  department?: string;
  employmentStatus?: string;
}

export const staffService = {
  async getStaffList(filters: StaffFilters = {}): Promise<Staff[]> {
    const response = await staffApi.get<Staff[] | { data: Staff[] }>("/staff", {
      params: {
        search: filters.search || undefined,
        department: filters.department || undefined,
        employmentStatus: filters.employmentStatus || undefined,
      },
    });
    const result = unwrapResponse(response.data);
    if (!Array.isArray(result)) {
      throw new Error("The staff list response was invalid.");
    }
    return result;
  },

  async getStaffById(id: string): Promise<Staff> {
    const response = await staffApi.get<Staff | { data: Staff }>(
      `/staff/${encodeURIComponent(id)}`,
    );
    return unwrapResponse(response.data);
  },

  async updateStaff(id: string, payload: StaffFormValues): Promise<Staff> {
    const response = await staffApi.put<Staff | { data: Staff }>(
      `/staff/${encodeURIComponent(id)}`,
      payload,
    );
    return unwrapResponse(response.data);
  },

  async deleteStaff(id: string): Promise<void> {
    await staffApi.delete(`/staff/${encodeURIComponent(id)}`);
  },
};
