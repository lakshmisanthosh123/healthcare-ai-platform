import { doctorApi as patientAPI } from "./api";

export const patientService = {
  // Get all patients for current doctor
  getDoctorPatients: async (page = 1, limit = 10, search = "") => {
    try {
      const response = await patientAPI.get("/patients/my-patients", {
        params: { page, limit, search },
      });
      return response.data;
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

  // Get patient medical history
  getPatientMedicalHistory: async (patientId: string) => {
    try {
      const response = await patientAPI.get(
        `/patients/${patientId}/medical-history`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search patients
  searchPatients: async (query: string) => {
    try {
      const response = await patientAPI.get("/patients/search", {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add patient notes
  addPatientNotes: async (patientId: string, notes: string) => {
    try {
      const response = await patientAPI.post(`/patients/${patientId}/notes`, {
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get patient details with full history
  getPatientFullDetails: async (patientId: string) => {
    try {
      const response = await patientAPI.get(
        `/patients/${patientId}/full-details`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
