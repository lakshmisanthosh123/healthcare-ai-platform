import { useState } from "react";
import type { Patient } from "@healthcare-platform/types";
import { usePatientProfile } from "../hooks";
import { PatientDetailsCard, ProfileModal } from "../components";
import { useTranslator } from "../hooks/useTranslator";
import "../styles/pages.css";

export const PatientDetailsPage = () => {
  const { patient, loading, error, updateProfile } = usePatientProfile();
  const t = useTranslator();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  const handleProfileUpdate = async (data: Partial<Patient>) => {
    setUpdateError("");
    try {
      await updateProfile(data);
      setSuccessMessage(t("patient.profileUpdated"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError("Could not update your profile. Please try again.");
      throw err;
    }
  };

  if (loading && !patient) {
    return <div className="page-loading">{t("patient.loading")}</div>;
  }

  if (error) {
    return <div className="page-error">Error: {error}</div>;
  }

  return (
    <div className="patient-details-page">
      <div className="page-header">
        <h1>{t("patient.myProfile")}</h1>
        <p>{t("patient.profileDescription")}</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {updateError && (
        <div className="page-error" role="alert">
          {updateError}
        </div>
      )}

      <div className="page-content">
        <PatientDetailsCard
          patient={patient}
          onEdit={() => setIsModalOpen(true)}
        />
      </div>

      <ProfileModal
        isOpen={isModalOpen}
        patient={patient}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProfileUpdate}
        loading={loading}
      />
    </div>
  );
};
