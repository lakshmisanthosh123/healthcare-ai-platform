import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  StaffFormValues,
  StaffProfileFormValues,
} from "@healthcare-platform/validation";
import type { ChangePasswordRequest, Staff } from "@healthcare-platform/types";
import type { StaffFilters } from "../services/staffService";
import { staffService } from "../services/staffService";
import { staffProfileService } from "../services/staffProfileService";
import { staffDashboardService } from "../services/staffDashboardService";

export const staffQueryKeys = {
  all: ["staff"] as const,
  lists: () => [...staffQueryKeys.all, "list"] as const,
  list: (filters: StaffFilters) =>
    [...staffQueryKeys.lists(), filters] as const,
  details: () => [...staffQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...staffQueryKeys.details(), id] as const,
  profile: () => [...staffQueryKeys.all, "profile"] as const,
  dashboard: () => [...staffQueryKeys.all, "dashboard"] as const,
};

export function useStaffList(filters: StaffFilters) {
  return useQuery({
    queryKey: staffQueryKeys.list(filters),
    queryFn: () => staffService.getStaffList(filters),
  });
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: staffQueryKeys.detail(id ?? ""),
    queryFn: () => staffService.getStaffById(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useStaffProfile() {
  return useQuery({
    queryKey: staffQueryKeys.profile(),
    queryFn: staffProfileService.getProfile,
  });
}

export function useStaffDashboardStats() {
  return useQuery({
    queryKey: staffQueryKeys.dashboard(),
    queryFn: staffDashboardService.getStats,
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StaffFormValues }) =>
      staffService.updateStaff(id, payload),
    onSuccess: async (staff) => {
      queryClient.setQueryData(staffQueryKeys.detail(staff.id), staff);
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.deleteStaff,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
  });
}

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: StaffProfileFormValues & Pick<Staff, "avatar" | "document">,
    ) => staffProfileService.updateProfile(payload),
    onSuccess: async (staff) => {
      queryClient.setQueryData(staffQueryKeys.profile(), staff);
      queryClient.setQueryData(staffQueryKeys.detail(staff.id), staff);
      await queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() });
    },
  });
}

export function useChangeStaffPassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      staffProfileService.changePassword(payload),
  });
}
