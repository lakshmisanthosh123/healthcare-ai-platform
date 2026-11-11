import React from "react";
import type { Doctor } from "@healthcare-platform/types";
import "../styles/components.css";

interface DoctorTableProps {
  doctors: Doctor[];
  onSelectDoctor?: (doctor: Doctor) => void;
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const DoctorTable: React.FC<DoctorTableProps> = ({
  doctors,
  onSelectDoctor,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}) => {
  if (loading) {
    return <div className="loader">Loading doctors...</div>;
  }

  if (doctors.length === 0) {
    return <div className="empty-state">No doctors found</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Specialty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="table-row">
              <td>{doctor.id}</td>
              <td>{doctor.firstName}</td>
              <td>{doctor.lastName}</td>
              <td>{doctor.email || "-"}</td>
              <td>{doctor.phone || "-"}</td>
              <td>{doctor.specialty || "-"}</td>
              <td>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onSelectDoctor?.(doctor)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
