import { patientApi as prescriptionAPI } from "./api";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  instructions?: string;
  notes?: string;
  createdAt: string;
  status?: "active" | "expired" | "completed";
}

export const prescriptionService = {
  // Get patient's prescriptions
  getPrescriptions: async (page = 1, limit = 10, status?: string) => {
    try {
      const response = await prescriptionAPI.get("/prescriptions/me", {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prescription by ID
  getPrescriptionById: async (id: string) => {
    try {
      const response = await prescriptionAPI.get(`/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get active prescriptions only
  getActivePrescriptions: async () => {
    try {
      const response = await prescriptionAPI.get("/prescriptions/me/active");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prescriptions by doctor
  getPrescriptionsByDoctor: async (doctorId: string) => {
    try {
      const response = await prescriptionAPI.get(
        "/prescriptions/me/by-doctor",
        {
          params: { doctorId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export prescription as PDF
  exportAsPDF: async (id: string) => {
    try {
      const response = await prescriptionAPI.get(
        `/prescriptions/${id}/export-pdf`,
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set prescription reminder
  setReminder: async (id: string, reminderTime: string) => {
    try {
      const response = await prescriptionAPI.post(
        `/prescriptions/${id}/reminder`,
        {
          reminderTime,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prescription refill status
  getRefillStatus: async (id: string) => {
    try {
      const response = await prescriptionAPI.get(
        `/prescriptions/${id}/refill-status`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request prescription refill
  requestRefill: async (id: string) => {
    try {
      const response = await prescriptionAPI.post(
        `/prescriptions/${id}/request-refill`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
