import { useState, useEffect, useCallback } from "react";
import { doctorService } from "../services/doctorService";
import type { Doctor } from "@healthcare-platform/types";
export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDoctors = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.getAllDoctors(page, 20);
      setDoctors(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctors");
      console.error("Doctors fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDoctors = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchDoctors();
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await doctorService.searchDoctors(query);
        setDoctors(response.data || response);
      } catch (err: any) {
        setError(err.message || "Failed to search doctors");
      } finally {
        setLoading(false);
      }
    },
    [fetchDoctors],
  );

  const filterBySpecialty = useCallback(async (specialty: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.getDoctorsBySpecialty(specialty);
      setDoctors(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to filter doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  const getDoctorAvailability = useCallback(
    async (doctorId: string, date: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await doctorService.getDoctorAvailability(
          doctorId,
          date,
        );
        return response.data || response;
      } catch (err: any) {
        setError(err.message || "Failed to fetch availability");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getMyDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.getMyDoctors();
      setDoctors(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch your doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    selectedDoctor,
    loading,
    error,
    totalPages,
    currentPage,
    fetchDoctors,
    searchDoctors,
    filterBySpecialty,
    getDoctorAvailability,
    getMyDoctors,
    setSelectedDoctor,
  };
};
