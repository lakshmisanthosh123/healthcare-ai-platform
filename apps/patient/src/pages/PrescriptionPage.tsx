import { useState } from "react";
import { usePrescriptions } from "../hooks";
import { PrescriptionCard } from "../components";
import { useTranslator } from "../hooks/useTranslator";
import "../styles/pages.css";

export const PrescriptionPage = () => {
  const {
    prescriptions,
    loading,
    error,
    fetchPrescriptions,
    requestRefill,
    exportAsPDF,
  } = usePrescriptions();
  const t = useTranslator();
  const [statusFilter, setStatusFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    await fetchPrescriptions(1, status || undefined);
  };

  const handleRequestRefill = async (id: string) => {
    try {
      await requestRefill(id);
      setSuccessMessage(t("patient.refillSubmitted"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (requestError) {
      console.error("Refill request failed:", requestError);
    }
  };

  const handleExport = async (id: string) => {
    try {
      await exportAsPDF(id);
    } catch (exportError) {
      console.error("Export failed:", exportError);
    }
  };

  return (
    <div className="prescription-page">
      <div className="page-header">
        <h1>{t("patient.prescriptionsTitle")}</h1>
        <p>{t("patient.prescriptionsDescription")}</p>
      </div>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <div className="page-controls">
        <div className="filter-group">
          <label>{t("patient.filterStatus")}</label>
          <select
            value={statusFilter}
            onChange={(event) => void handleStatusFilter(event.target.value)}
          >
            <option value="">{t("patient.allPrescriptions")}</option>
            <option value="active">{t("patient.active")}</option>
            <option value="expired">{t("patient.expired")}</option>
            <option value="completed">{t("patient.completed")}</option>
          </select>
        </div>
      </div>
      <div className="page-content">
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading">{t("patient.loading")}</div>
        ) : prescriptions.length > 0 ? (
          <div className="prescriptions-grid">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onRequestRefill={handleRequestRefill}
                onExport={handleExport}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{t("patient.noPrescriptions")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
