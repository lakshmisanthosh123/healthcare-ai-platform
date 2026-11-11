import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type {
  patientAppointment,
  Appointment,
} from "@healthcare-platform/types";
import { appointmentService } from "../services/appointmentService";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAppointments = useCallback(async (page = 1, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAppointments(
        page,
        10,
        status,
      );
      setAppointments(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
      console.error("Appointments fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getUpcomingAppointments();
      setUpcomingAppointments(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch upcoming appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  const bookAppointment = useCallback(async (data: patientAppointment) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.bookAppointment(data);
      const newAppointment = response.data || response;
      setAppointments((prev) => [newAppointment, ...prev]);
      if (
        newAppointment.status === "scheduled" &&
        new Date(`${newAppointment.date}T${newAppointment.time || "00:00"}`) >
          new Date()
      ) {
        setUpcomingAppointments((prev) => [newAppointment, ...prev]);
      }
      return newAppointment;
    } catch (err: any) {
      const detail = axios.isAxiosError<{ detail?: unknown }>(err)
        ? err.response?.data?.detail
        : undefined;
      const message =
        typeof detail === "string"
          ? detail
          : err instanceof Error
            ? err.message
            : "Failed to book appointment";
      setError(message);
      throw new Error(message, { cause: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const rescheduleAppointment = useCallback(
    async (id: string, newDate: string, newTime: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentService.rescheduleAppointment(
          id,
          newDate,
          newTime,
        );
        const updated = response.data || response;
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? updated : apt)),
        );
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(updated);
        }
        return updated;
      } catch (err: any) {
        setError(err.message || "Failed to reschedule appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedAppointment],
  );

  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await appointmentService.cancelAppointment(id, reason);
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        setUpcomingAppointments((prev) => prev.filter((apt) => apt.id !== id));
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to cancel appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedAppointment],
  );

  const getAvailableSlots = useCallback(
    async (doctorId: string, date: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentService.getAvailableSlots(
          doctorId,
          date,
        );
        return response;
      } catch (err: any) {
        setError(err.message || "Failed to fetch available slots");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAppointments();
    fetchUpcomingAppointments();
  }, [fetchAppointments, fetchUpcomingAppointments]);

  return {
    appointments,
    upcomingAppointments,
    selectedAppointment,
    loading,
    error,
    totalPages,
    currentPage,
    fetchAppointments,
    fetchUpcomingAppointments,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getAvailableSlots,
    setSelectedAppointment,
  };
};
