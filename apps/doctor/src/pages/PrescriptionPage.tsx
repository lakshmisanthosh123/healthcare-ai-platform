import React, { useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePatient } from "../hooks/usePatient";
import { PrescriptionForm } from "../components/PrescriptionForm";
import { prescriptionService } from "../services/prescriptionService";
import type {
  DoctorPrescription,
  PrescriptionData,
} from "../services/prescriptionService";
import "../styles/PrescriptionPage.css";

export const PrescriptionPage: React.FC = () => {
  const t = useTranslator();
  const { patients } = usePatient();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowForm(false);

    if (patientId) {
      setLoading(true);
      try {
        const response =
          await prescriptionService.getPatientPrescriptions(patientId);
        setPrescriptions(response.data || response);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreatePrescription = async (
    data: Omit<PrescriptionData, "patientId">,
  ) => {
    if (!selectedPatientId) {
      alert("Please select a patient first");
      return;
    }

    setLoading(true);
    try {
      const prescriptionData = {
        patientId: selectedPatientId,
        ...data,
      };
      await prescriptionService.createPrescription(prescriptionData);
      alert("Prescription created successfully");
      setShowForm(false);
      // Refresh prescriptions
      handlePatientSelect(selectedPatientId);
    } catch (error) {
      alert("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    setLoading(true);
    try {
      await prescriptionService.deletePrescription(prescriptionId);
      alert("Prescription deleted successfully");
      handlePatientSelect(selectedPatientId);
    } catch (error) {
      alert("Failed to delete prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-page">
      <div className="page-header">
        <h1>{t("doctor.prescriptionsTitle")}</h1>
        <p>{t("doctor.prescriptionsDescription")}</p>
      </div>

      <div className="prescription-container">
        <div className="patient-selector">
          <h3>{t("doctor.selectPatient")}</h3>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="patient-select"
          >
            <option value="">{t("doctor.selectPatientOption")}</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        {selectedPatientId && (
          <>
            <div className="prescription-actions">
              <button
                className="btn-primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? t("doctor.cancel") : t("doctor.createPrescription")}
              </button>
            </div>

            {showForm && (
              <div className="prescription-form-section">
                <PrescriptionForm
                  patientName={
                    selectedPatient
                      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                      : "Unknown"
                  }
                  onSubmit={handleCreatePrescription}
                  loading={loading}
                />
              </div>
            )}

            <div className="prescriptions-list">
              <h3>{t("doctor.prescriptionHistory")}</h3>
              {loading && !showForm ? (
                <div className="loader">Loading prescriptions...</div>
              ) : prescriptions.length > 0 ? (
                <div className="prescriptions-grid">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="prescription-card">
                      <div className="prescription-header">
                        <h4>Prescription #{prescription.id}</h4>
                        <span className="prescription-date">
                          {new Date(
                            prescription.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="medications-list">
                        <h5>Medications:</h5>
                        {prescription.medications?.map((med, idx) => (
                          <div key={idx} className="medication-item">
                            <strong>{med.name}</strong> - {med.dosage}
                            <br />
                            <small>
                              {med.frequency} for {med.duration}
                            </small>
                            {med.notes && <br />}
                            {med.notes && (
                              <small style={{ fontStyle: "italic" }}>
                                Note: {med.notes}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>

                      {prescription.instructions && (
                        <div className="prescription-instructions">
                          <strong>{t("appointment.reason")}:</strong>
                          <p>{prescription.instructions}</p>
                        </div>
                      )}

                      <div className="prescription-actions-card">
                        <button
                          className="btn-danger btn-sm"
                          onClick={() =>
                            handleDeletePrescription(prescription.id)
                          }
                        >
                          {t("doctor.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">{t("doctor.noPrescriptions")}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
