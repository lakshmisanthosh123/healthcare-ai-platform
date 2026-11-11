import { useState, useEffect, useCallback } from "react";
import type { MedicalRecord } from "@healthcare-platform/types";
import { medicalHistoryService } from "../services/medicalHistoryService";

export const useMedicalHistory = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMedicalHistory = useCallback(async (page = 1, type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicalHistoryService.getMedicalHistory(
        page,
        10,
        type,
      );
      setRecords(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch medical history");
      console.error("Medical history fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecordsByType = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicalHistoryService.getRecordsByType(
        type,
        1,
        10,
      );
      setRecords(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch records by type");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecordsByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await medicalHistoryService.getRecordsByDateRange(
          startDate,
          endDate,
          1,
          10,
        );
        setRecords(response.data || response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch records by date range");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getMedicalSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicalHistoryService.getMedicalSummary();
      return response.data || response;
    } catch (err: any) {
      setError(err.message || "Failed to fetch medical summary");
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAsCSV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await medicalHistoryService.exportAsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-history-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to export medical history");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicalHistory();
  }, [fetchMedicalHistory]);

  return {
    records,
    selectedRecord,
    loading,
    error,
    totalPages,
    currentPage,
    fetchMedicalHistory,
    getRecordsByType,
    getRecordsByDateRange,
    getMedicalSummary,
    exportAsCSV,
    setSelectedRecord,
  };
};
