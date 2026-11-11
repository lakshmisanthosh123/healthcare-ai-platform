import type { ChangePasswordRequest, Staff } from "@healthcare-platform/types";
import type { StaffProfileFormValues } from "@healthcare-platform/validation";
import { staffApi, unwrapResponse } from "./api";

export const staffProfileService = {
  async getProfile(): Promise<Staff> {
    const response = await staffApi.get<Staff | { data: Staff }>(
      "/staff/profile",
    );
    return unwrapResponse(response.data);
  },

  async updateProfile(
    payload: StaffProfileFormValues & Pick<Staff, "avatar" | "document">,
  ): Promise<Staff> {
    const response = await staffApi.put<Staff | { data: Staff }>(
      "/staff/profile",
      payload,
    );
    return unwrapResponse(response.data);
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await staffApi.put("/staff/profile/password", payload);
  },
};
