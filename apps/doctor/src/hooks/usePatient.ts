import { useState, useEffect, useCallback } from "react";
import type { Patient } from "@healthcare-platform/types";
import { patientService } from "../services/patientService";

export const usePatient = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDoctorPatients = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getDoctorPatients(page, 10, search);
      setPatients(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatientById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getPatientById(id);
      setSelectedPatient(response.data || response);
      return response.data || response;
    } catch (err: any) {
      setError(err.message || "Failed to fetch patient");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatientMedicalHistory = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getPatientMedicalHistory(patientId);
      return response.data || response;
    } catch (err: any) {
      setError(err.message || "Failed to fetch medical history");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatients = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.searchPatients(query);
      setPatients(response.data || response);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorPatients();
  }, [fetchDoctorPatients]);

  return {
    patients,
    selectedPatient,
    loading,
    error,
    totalPages,
    currentPage,
    fetchDoctorPatients,
    getPatientById,
    getPatientMedicalHistory,
    searchPatients,
    setSelectedPatient,
  };
};
