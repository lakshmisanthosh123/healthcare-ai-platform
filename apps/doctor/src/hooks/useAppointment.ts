import { useState, useEffect, useCallback } from "react";
import type { Appointment } from "@healthcare-platform/types";
import { appointmentService } from "../services/appointmentService";

export const useAppointment = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate(new Date()),
  );

  const fetchAppointmentsByDate = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await appointmentService.getDoctorAppointmentsByDate(date);
      setAppointments(response.data || response);
      setSelectedDate(date);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getTodayAppointments();
      setTodayAppointments(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch today's appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      const response = await appointmentService.getUpcomingAppointments();
      setUpcomingAppointments(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch upcoming appointments");
    }
  }, []);

  const fetchAllAppointments = useCallback(
    async (page = 1, status?: "scheduled" | "completed" | "cancelled") => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentService.getDoctorAppointments(
          page,
          10,
          status,
        );
        setAppointments(response.data || response);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: "scheduled" | "completed" | "cancelled") => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentService.updateAppointmentStatus(
          id,
          status,
        );
        const updated = response.data || response;
        setAppointments((prev) =>
          updated.date === selectedDate
            ? prev.map((apt) => (apt.id === id ? updated : apt))
            : prev.filter((apt) => apt.id !== id),
        );
        setTodayAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? updated : apt)),
        );
        setUpcomingAppointments((prev) =>
          prev
            .map((apt) => (apt.id === id ? updated : apt))
            .filter(
              (apt) =>
                apt.status === "scheduled" &&
                apt.date >= formatLocalDate(new Date()),
            ),
        );
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(updated);
        }
        return updated;
      } catch (err: any) {
        setError(err.message || "Failed to update appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedAppointment, selectedDate],
  );

  const rescheduleAppointment = useCallback(
    async (id: string, newDate: string, newTime?: string) => {
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
          updated.date === selectedDate
            ? prev.map((apt) => (apt.id === id ? updated : apt))
            : prev.filter((apt) => apt.id !== id),
        );
        setTodayAppointments((prev) =>
          prev
            .map((apt) => (apt.id === id ? updated : apt))
            .filter((apt) => apt.date === formatLocalDate(new Date())),
        );
        setUpcomingAppointments((prev) =>
          prev
            .map((apt) => (apt.id === id ? updated : apt))
            .filter(
              (apt) =>
                apt.status === "scheduled" &&
                apt.date >= formatLocalDate(new Date()),
            ),
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
    [selectedAppointment, selectedDate],
  );

  useEffect(() => {
    fetchTodayAppointments();
    fetchUpcomingAppointments();
    fetchAppointmentsByDate(selectedDate);
  }, [
    selectedDate,
    fetchTodayAppointments,
    fetchUpcomingAppointments,
    fetchAppointmentsByDate,
  ]);

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    selectedAppointment,
    loading,
    error,
    totalPages,
    currentPage,
    selectedDate,
    fetchAppointmentsByDate,
    fetchTodayAppointments,
    fetchAllAppointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    setSelectedAppointment,
    setSelectedDate,
  };
};

function formatLocalDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
