import { useState, useEffect, useCallback } from "react";
import type { Prescription } from "@healthcare-platform/types";
import { prescriptionService } from "../services/prescriptionService";

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPrescriptions = useCallback(async (page = 1, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionService.getPrescriptions(
        page,
        10,
        status,
      );
      setPrescriptions(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prescriptions");
      console.error("Prescriptions fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getActivePrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionService.getActivePrescriptions();
      setPrescriptions(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch active prescriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPrescriptionsByDoctor = useCallback(async (doctorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await prescriptionService.getPrescriptionsByDoctor(doctorId);
      setPrescriptions(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prescriptions by doctor");
    } finally {
      setLoading(false);
    }
  }, []);

  const setReminder = useCallback(async (id: string, reminderTime: string) => {
    setLoading(true);
    setError(null);
    try {
      await prescriptionService.setReminder(id, reminderTime);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to set reminder");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestRefill = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionService.requestRefill(id);
      return response.data || response;
    } catch (err: any) {
      setError(err.message || "Failed to request refill");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAsPDF = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await prescriptionService.exportAsPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to export prescription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return {
    prescriptions,
    selectedPrescription,
    loading,
    error,
    totalPages,
    currentPage,
    fetchPrescriptions,
    getActivePrescriptions,
    getPrescriptionsByDoctor,
    setReminder,
    requestRefill,
    exportAsPDF,
    setSelectedPrescription,
  };
};
