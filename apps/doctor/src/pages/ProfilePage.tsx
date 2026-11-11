import React, { useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { useDoctor } from "../hooks/useDoctor";
import { ProfileModal } from "../components/ProfileModal";
import type { Doctor } from "@healthcare-platform/types";
import "../styles/DoctorListPage.css";

export const ProfilePage: React.FC = () => {
  const t = useTranslator();
  const { doctor, updateProfile, loading } = useDoctor();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileUpdate = async (data: Partial<Doctor>) => {
    try {
      await updateProfile(data);
      setSuccessMessage("Profile updated successfully");
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>{t("doctor.profile")}</h1>
        <p>{t("doctor.profileDescription")}</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {doctor && (
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {doctor.avatar ? (
                  <img src={doctor.avatar} alt="Profile photo" />
                ) : (
                  "👤"
                )}
              </div>
              <div className="profile-info">
                <h2>
                  {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="specialty">
                  {doctor.specialty || t("doctor.notSpecified")}
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <label>{t("login.email")}:</label>
                <span>{doctor.email || t("doctor.notProvided")}</span>
              </div>

              <div className="detail-row">
                <label>{t("doctor.phone")}:</label>
                <span>{doctor.phone || t("doctor.notProvided")}</span>
              </div>

              <div className="detail-row">
                <label>{t("doctor.specialty")}:</label>
                <span>{doctor.specialty || t("doctor.notSpecified")}</span>
              </div>

              <div className="detail-row">
                <label>Appointment availability:</label>
                <span>
                  {doctor.availability?.length
                    ? doctor.availability
                        .map((entry) =>
                          typeof entry === "string"
                            ? entry
                            : `${entry.day}: ${entry.from}-${entry.to}`,
                        )
                        .join(", ")
                    : "No availability configured"}
                </span>
              </div>

              <div className="detail-row">
                <label>{t("doctor.memberSince")}</label>
                <span>
                  {doctor.createdAt
                    ? new Date(doctor.createdAt).toLocaleDateString()
                    : t("doctor.notSpecified")}
                </span>
              </div>

              <div className="detail-row">
                <label>{t("doctor.lastUpdated")}</label>
                <span>
                  {doctor.updatedAt
                    ? new Date(doctor.updatedAt).toLocaleDateString()
                    : t("doctor.notSpecified")}
                </span>
              </div>
              {doctor.document && (
                <div className="detail-row">
                  <label>Document:</label>
                  <a
                    href={doctor.document.dataUrl}
                    download={doctor.document.name}
                  >
                    {doctor.document.name}
                  </a>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button
                className="btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                {t("doctor.editProfile")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isModalOpen}
        doctor={doctor}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProfileUpdate}
        loading={loading}
      />
    </div>
  );
};
