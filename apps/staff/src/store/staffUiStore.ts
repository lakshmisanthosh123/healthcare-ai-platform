import { create } from "zustand";

export interface StaffFiltersState {
  search: string;
  department: string;
  employmentStatus: string;
}

interface StaffUiState {
  filters: StaffFiltersState;
  selectedStaffId: string | null;
  isStaffFormOpen: boolean;
  isProfileMenuOpen: boolean;
  setSearch: (search: string) => void;
  setDepartment: (department: string) => void;
  setEmploymentStatus: (employmentStatus: string) => void;
  selectStaff: (id: string | null) => void;
  setStaffFormOpen: (open: boolean) => void;
  setProfileMenuOpen: (open: boolean) => void;
  toggleProfileMenu: () => void;
  resetFilters: () => void;
}

const emptyFilters = {
  search: "",
  department: "",
  employmentStatus: "",
};

export const useStaffUiStore = create<StaffUiState>((set) => ({
  filters: emptyFilters,
  selectedStaffId: null,
  isStaffFormOpen: false,
  isProfileMenuOpen: false,
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  setDepartment: (department) =>
    set((state) => ({ filters: { ...state.filters, department } })),
  setEmploymentStatus: (employmentStatus) =>
    set((state) => ({ filters: { ...state.filters, employmentStatus } })),
  selectStaff: (selectedStaffId) => set({ selectedStaffId }),
  setStaffFormOpen: (isStaffFormOpen) => set({ isStaffFormOpen }),
  setProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  toggleProfileMenu: () =>
    set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
  resetFilters: () => set({ filters: { ...emptyFilters } }),
}));
