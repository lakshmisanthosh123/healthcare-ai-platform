import type { Doctor } from "@healthcare-platform/types";
import { doctorApi } from "./api";

export const doctorService = {
  // Get all doctors
  getAllDoctors: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await doctorApi.get("/doctors", {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor by ID
  getDoctorById: async (id: string) => {
    try {
      const response = await doctorApi.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current doctor profile
  getProfile: async () => {
    try {
      const response = await doctorApi.get("/doctors/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update doctor profile
  updateProfile: async (data: Partial<Doctor>) => {
    try {
      const response = await doctorApi.put("/doctors/profile", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await doctorApi.put("/doctors/profile/password", data);
    return response.data;
  },

  // Search doctors
  searchDoctors: async (query: string) => {
    try {
      const response = await doctorApi.get("/doctors/search", {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Filter doctors by specialty
  getDoctorsBySpecialty: async (specialty: string) => {
    try {
      const response = await doctorApi.get("/doctors/filter", {
        params: { specialty },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
