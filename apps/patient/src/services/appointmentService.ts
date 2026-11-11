import { patientApi as appointmentAPI } from "./api";

export interface AppointmentBookingData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

export const appointmentService = {
  // Get patient's appointments
  getAppointments: async (page = 1, limit = 10, status?: string) => {
    try {
      const response = await appointmentAPI.get("/appointments/me", {
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

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    try {
      const response = await appointmentAPI.get("/appointments/me/upcoming");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get past appointments
  getPastAppointments: async (page = 1, limit = 10) => {
    try {
      const response = await appointmentAPI.get("/appointments/me/past", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create/Book appointment
  bookAppointment: async (data: AppointmentBookingData) => {
    try {
      const response = await appointmentAPI.post("/appointments", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    id: string,
    newDate: string,
    newTime: string,
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

  // Get available time slots for doctor
  getAvailableSlots: async (doctorId: string, date: string) => {
    try {
      const response = await appointmentAPI.get<{ slots: string[] }>(
        "/appointments/available-slots",
        {
          params: { doctorId, date },
        },
      );
      return response.data.slots;
    } catch (error) {
      throw error;
    }
  },

  // Confirm appointment reminder
  confirmReminder: async (id: string) => {
    try {
      const response = await appointmentAPI.post(
        `/appointments/${id}/confirm-reminder`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add appointment note
  addNotes: async (id: string, notes: string) => {
    try {
      const response = await appointmentAPI.post(`/appointments/${id}/notes`, {
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
