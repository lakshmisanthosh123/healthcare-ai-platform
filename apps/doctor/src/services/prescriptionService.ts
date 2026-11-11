import { doctorApi as prescriptionAPI } from "./api";
import type { Medication, Prescription } from "@healthcare-platform/types";

export interface PrescriptionData {
  patientId: string;
  medications: Medication[];
  instructions?: string;
  notes?: string;
}

export type DoctorPrescription = Prescription & {
  medications: Medication[];
};

export const prescriptionService = {
  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId: string) => {
    try {
      const response = await prescriptionAPI.get(
        `/prescriptions/patient/${patientId}`,
      );
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

  // Create prescription
  createPrescription: async (data: PrescriptionData) => {
    try {
      const response = await prescriptionAPI.post("/prescriptions", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update prescription
  updatePrescription: async (id: string, data: Partial<PrescriptionData>) => {
    try {
      const response = await prescriptionAPI.put(`/prescriptions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete prescription
  deletePrescription: async (id: string) => {
    try {
      const response = await prescriptionAPI.delete(`/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prescriptions by doctor
  getDoctorPrescriptions: async (page = 1, limit = 10) => {
    try {
      const response = await prescriptionAPI.get("/prescriptions/doctor/all", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export prescription as PDF
  exportPrescriptionAsPDF: async (id: string) => {
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
};
