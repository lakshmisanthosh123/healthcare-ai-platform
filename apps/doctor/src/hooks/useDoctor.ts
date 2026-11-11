import { useState, useEffect, useCallback } from "react";
import type { Doctor } from "@healthcare-platform/types";
import { doctorService } from "../services/doctorService";

export const useDoctor = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.getProfile();
      setDoctor(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctor profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllDoctors = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.getAllDoctors(page, 10, search);
      setDoctors(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<Doctor>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.updateProfile(data);
      setDoctor(response.data || response);
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDoctors = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorService.searchDoctors(query);
      setDoctors(response.data || response);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    doctor,
    doctors,
    loading,
    error,
    totalPages,
    currentPage,
    fetchProfile,
    fetchAllDoctors,
    updateProfile,
    searchDoctors,
  };
};
