import { patientApi as medicalHistoryAPI } from "./api";

export interface MedicalRecord {
  id: string;
  date: string;
  type: string; // diagnosis, treatment, test, etc.
  description: string;
  doctorName?: string;
  notes?: string;
  attachments?: string[];
}

export const medicalHistoryService = {
  // Get patient's medical history
  getMedicalHistory: async (page = 1, limit = 10, type?: string) => {
    try {
      const response = await medicalHistoryAPI.get("/medical-history/me", {
        params: { page, limit, type },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medical record by ID
  getRecordById: async (id: string) => {
    try {
      const response = await medicalHistoryAPI.get(`/medical-history/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all records by type
  getRecordsByType: async (type: string, page = 1, limit = 10) => {
    try {
      const response = await medicalHistoryAPI.get("/medical-history/by-type", {
        params: { type, page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get records by date range
  getRecordsByDateRange: async (
    startDate: string,
    endDate: string,
    page = 1,
    limit = 10,
  ) => {
    try {
      const response = await medicalHistoryAPI.get(
        "/medical-history/by-date-range",
        {
          params: { startDate, endDate, page, limit },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get medical summary
  getMedicalSummary: async () => {
    try {
      const response = await medicalHistoryAPI.get("/medical-history/summary");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export medical history as PDF
  exportAsCSV: async () => {
    try {
      const response = await medicalHistoryAPI.get(
        "/medical-history/export-csv",
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download medical record attachment
  downloadAttachment: async (recordId: string, attachmentId: string) => {
    try {
      const response = await medicalHistoryAPI.get(
        `/medical-history/${recordId}/attachment/${attachmentId}`,
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
