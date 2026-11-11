import { doctorApi as appointmentAPI } from "./api";

export const appointmentService = {
  // Get appointments for current doctor on specific date
  getDoctorAppointmentsByDate: async (date: string) => {
    try {
      const response = await appointmentAPI.get(
        "/appointments/doctor/by-date",
        {
          params: { date },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all appointments for current doctor
  getDoctorAppointments: async (
    page = 1,
    limit = 10,
    status?: "scheduled" | "completed" | "cancelled",
  ) => {
    try {
      const response = await appointmentAPI.get("/appointments/doctor/all", {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (id: string) => {
    try {
      const response = await appointmentAPI.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (
    id: string,
    status: "scheduled" | "completed" | "cancelled",
  ) => {
    try {
      const response = await appointmentAPI.put(`/appointments/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    id: string,
    newDate: string,
    newTime?: string,
  ) => {
    try {
      const response = await appointmentAPI.put(
        `/appointments/${id}/reschedule`,
        {
          date: newDate,
          time: newTime,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (id: string, reason?: string) => {
    try {
      const response = await appointmentAPI.put(`/appointments/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    try {
      const response = await appointmentAPI.get("/appointments/doctor/today");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (days = 7) => {
    try {
      const response = await appointmentAPI.get(
        "/appointments/doctor/upcoming",
        {
          params: { days },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
