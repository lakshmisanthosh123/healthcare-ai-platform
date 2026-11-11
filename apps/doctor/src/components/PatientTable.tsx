import React from "react";
import type { Patient } from "@healthcare-platform/types";
import "../styles/components.css";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient?: (patient: Patient) => void;
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onSelectPatient,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}) => {
  if (loading) {
    return <div className="loader">Loading patients...</div>;
  }

  if (patients.length === 0) {
    return <div className="empty-state">No patients found</div>;
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
            <th>Date of Birth</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="table-row">
              <td>{patient.id}</td>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{patient.email || "-"}</td>
              <td>{patient.phone || "-"}</td>
              <td>
                {patient.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onSelectPatient?.(patient)}
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
