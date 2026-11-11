import { useState, useEffect, useCallback } from "react";
import type { Patient } from "@healthcare-platform/types";
import { patientService } from "../services/patientService";

export const usePatientProfile = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getProfile();
      setPatient(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch patient profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<Patient>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.updateProfile(data);
      setPatient(response);
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.uploadAvatar(file);
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    patient,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
  };
};
