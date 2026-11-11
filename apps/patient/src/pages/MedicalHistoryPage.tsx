import { useState } from "react";
import { useMedicalHistory } from "../hooks";
import { MedicalHistoryTimeline } from "../components";
import { useTranslator } from "../hooks/useTranslator";
import "../styles/pages.css";

export const MedicalHistoryPage = () => {
  const {
    records,
    loading,
    error,
    fetchMedicalHistory,
    getRecordsByType,
    exportAsCSV,
  } = useMedicalHistory();
  const t = useTranslator();
  const [selectedType, setSelectedType] = useState("");

  const handleTypeFilter = async (type: string) => {
    setSelectedType(type);
    if (type) {
      await getRecordsByType(type);
    } else {
      await fetchMedicalHistory();
    }
  };

  const handleExport = async () => {
    try {
      await exportAsCSV();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="medical-history-page">
      <div className="page-header">
        <h1>{t("patient.medicalHistory")}</h1>
        <p>{t("patient.historyDescription")}</p>
      </div>

      <div className="page-controls">
        <div className="filter-group">
          <label>{t("patient.filterType")}</label>
          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
          >
            <option value="">{t("patient.allRecords")}</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment">Treatment</option>
            <option value="test">Test Results</option>
            <option value="vaccination">Vaccination</option>
            <option value="surgery">Surgery</option>
            <option value="checkup">Checkup</option>
          </select>
        </div>

        <button onClick={handleExport} className="btn btn-secondary">
          📥 {t("patient.exportCsv")}
        </button>
      </div>

      <div className="page-content">
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading">{t("patient.loading")}</div>
        ) : records && records.length > 0 ? (
          <MedicalHistoryTimeline records={records} />
        ) : (
          <div className="empty-state">
            <p>{t("patient.noRecords")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
