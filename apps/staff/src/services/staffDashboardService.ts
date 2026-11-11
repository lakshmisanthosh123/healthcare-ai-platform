import type { StaffDashboardStats } from "@healthcare-platform/types";
import { staffApi, unwrapResponse } from "./api";

export const staffDashboardService = {
  async getStats(): Promise<StaffDashboardStats> {
    const response = await staffApi.get<
      StaffDashboardStats | { data: StaffDashboardStats }
    >("/staff/dashboard");
    return unwrapResponse(response.data);
  },
};
