import React, { useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { useDoctor } from "../hooks/useDoctor";
import { DoctorTable } from "../components/DoctorTable";
import "../styles/DoctorListPage.css";

export const DoctorListPage: React.FC = () => {
  const t = useTranslator();
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { doctors, loading, totalPages, currentPage, fetchAllDoctors } =
    useDoctor();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAllDoctors(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchAllDoctors(page, searchQuery);
  };

  return (
    <div className="doctor-list-page">
      <div className="page-header">
        <h1>{t("doctor.directory")}</h1>
        <p>{t("doctor.directoryDescription")}</p>
      </div>

      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={t("doctor.searchDoctors")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">
            {t("doctor.search")}
          </button>
        </form>
      </div>

      <div className="doctors-section">
        <DoctorTable
          doctors={doctors}
          loading={loading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onSelectDoctor={(doctor) => {
            // Handle doctor selection
            console.log("Selected doctor:", doctor);
          }}
        />
      </div>
    </div>
  );
};
