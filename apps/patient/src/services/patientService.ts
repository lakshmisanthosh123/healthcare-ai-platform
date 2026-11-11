import type { Patient } from "@healthcare-platform/types";
import { patientApi as patientAPI } from "./api";

const withResolvedAvatar = <T extends { avatar?: string }>(profile: T): T => ({
  ...profile,
  avatar: profile.avatar
    ? new URL(profile.avatar, patientAPI.defaults.baseURL).toString()
    : undefined,
});

export const patientService = {
  // Get current patient profile
  getProfile: async () => {
    try {
      const response = await patientAPI.get<Patient>("/patients/me");
      return withResolvedAvatar(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Update patient profile
  updateProfile: async (data: Partial<Patient>) => {
    try {
      const response = await patientAPI.put<Patient>("/patients/me", data);
      return withResolvedAvatar(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (id: string) => {
    try {
      const response = await patientAPI.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload patient avatar
  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await patientAPI.post<{ avatar: string }>(
        "/patients/me/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return withResolvedAvatar(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Get patient emergency contacts
  getEmergencyContacts: async () => {
    try {
      const response = await patientAPI.get("/patients/me/emergency-contacts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update emergency contacts
  updateEmergencyContacts: async (contacts: any[]) => {
    try {
      const response = await patientAPI.put("/patients/me/emergency-contacts", {
        contacts,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
