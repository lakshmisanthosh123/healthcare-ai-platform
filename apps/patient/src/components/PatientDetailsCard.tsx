import type { Patient } from "@healthcare-platform/types";
import "../styles/components.css";

interface PatientDetailsCardProps {
  patient: Patient | null;
  onEdit?: () => void;
}

export const PatientDetailsCard = ({
  patient,
  onEdit,
}: PatientDetailsCardProps) => {
  if (!patient) {
    return (
      <div className="patient-card loading">Loading patient details...</div>
    );
  }

  return (
    <div className="patient-card">
      <div className="patient-card-header">
        <div className="patient-avatar">
          {patient.avatar ? (
            <img src={patient.avatar} alt="Profile photo" />
          ) : (
            "👤"
          )}
        </div>
        <div className="patient-info">
          <h2>
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="patient-id">ID: {patient.id}</p>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="btn btn-primary">
            {" "}
            Edit Profile
          </button>
        )}
      </div>

      <div className="patient-details">
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{patient.email}</span>
        </div>
        <div className="detail-row">
          <span className="label">Phone:</span>
          <span className="value">{patient.phone || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Date of Birth:</span>
          <span className="value">
            {patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Gender:</span>
          <span className="value">{patient.gender || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Blood Type:</span>
          <span className="value">{patient.bloodType || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value">{patient.address || "N/A"}</span>
        </div>
        {patient.document && (
          <div className="detail-row">
            <span className="label">Document:</span>
            <a href={patient.document.dataUrl} download={patient.document.name}>
              {patient.document.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
