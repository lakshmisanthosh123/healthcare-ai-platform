import React, { useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePatient } from "../hooks/usePatient";
import { PatientTable } from "../components/PatientTable";
import "../styles/PatientsListPage.css";

export const PatientsListPage: React.FC = () => {
  const t = useTranslator();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    patients,
    loading,
    totalPages,
    currentPage,
    fetchDoctorPatients,
    searchPatients,
  } = usePatient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPatients(searchQuery);
    } else {
      fetchDoctorPatients(1, "");
    }
  };

  const handlePageChange = (page: number) => {
    fetchDoctorPatients(page, searchQuery);
  };

  return (
    <div className="patients-list-page">
      <div className="page-header">
        <h1>{t("doctor.myPatients")}</h1>
        <p>{t("doctor.patientsDescription")}</p>
      </div>

      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={t("doctor.searchPatients")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">
            {t("doctor.search")}
          </button>
        </form>
      </div>

      <div className="patients-section">
        <div className="section-info">
          <span>
            {patients.length} {t("doctor.patientsFound")}
          </span>
        </div>
        <PatientTable
          patients={patients}
          loading={loading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onSelectPatient={(patient) => {
            // Handle patient selection
            console.log("Selected patient:", patient);
          }}
        />
      </div>
    </div>
  );
};
