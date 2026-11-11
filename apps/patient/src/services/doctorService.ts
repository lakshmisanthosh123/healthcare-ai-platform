import { patientApi as doctorAPI } from "./api";

export const doctorService = {
  // Get all available doctors
  getAllDoctors: async (page = 1, limit = 20) => {
    try {
      const response = await doctorAPI.get("/doctors", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor by ID
  getDoctorById: async (id: string) => {
    try {
      const response = await doctorAPI.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search doctors by name or specialty
  searchDoctors: async (query: string) => {
    try {
      const response = await doctorAPI.get("/doctors/search", {
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
      const response = await doctorAPI.get("/doctors/by-specialty", {
        params: { specialty },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor's availability
  getDoctorAvailability: async (doctorId: string, date: string) => {
    try {
      const response = await doctorAPI.get(
        `/doctors/${doctorId}/availability`,
        {
          params: { date },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor's reviews
  getDoctorReviews: async (doctorId: string) => {
    try {
      const response = await doctorAPI.get(`/doctors/${doctorId}/reviews`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get patient's doctors (doctors who have treated patient)
  getMyDoctors: async () => {
    try {
      const response = await doctorAPI.get("/doctors/my-doctors");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
