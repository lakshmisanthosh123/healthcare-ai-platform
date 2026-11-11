import type { Prescription } from "@healthcare-platform/types";
import "../styles/components.css";

interface PrescriptionCardProps {
  prescription: Prescription;
  onRequestRefill?: (id: string) => void;
  onExport?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PrescriptionCard = ({
  prescription,
  onRequestRefill,
  onExport,
  onDelete,
}: PrescriptionCardProps) => {
  return (
    <div className="prescription-card">
      <div className="prescription-header">
        <h3>Prescription #{prescription.id}</h3>
        <span
          className={`prescription-status ${prescription.status || "active"}`}
        >
          {prescription.status || "Active"}
        </span>
      </div>

      <p className="prescription-date">
        {new Date(prescription.createdAt).toLocaleDateString()}
      </p>

      <div className="medications-section">
        <h4>Medications</h4>
        {/* {prescription.medications.map((med: Medication, idx: number) => (
          <div key={idx} className="medication-item">
            <div className="med-name">{med.name}</div>
            <div className="med-details">
              <span className="med-dosage">Dosage: {med.dosage}</span>
              <span className="med-frequency">Frequency: {med.frequency}</span>
              <span className="med-duration">Duration: {med.duration}</span>
            </div>
            {med.notes && <p className="med-notes">Notes: {med.notes}</p>}
          </div>
        ))} */}
      </div>

      {prescription.instructions && (
        <div className="instructions-section">
          <h4>Instructions</h4>
          <p>{prescription.instructions}</p>
        </div>
      )}

      {prescription.notes && (
        <div className="notes-section">
          <h4>Notes</h4>
          <p>{prescription.notes}</p>
        </div>
      )}

      <div className="prescription-actions">
        {onRequestRefill && (
          <button
            onClick={() => onRequestRefill(prescription.id)}
            className="btn btn-secondary"
          >
            Request Refill
          </button>
        )}
        {onExport && (
          <button
            onClick={() => onExport(prescription.id)}
            className="btn btn-secondary"
          >
            Export PDF
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(prescription.id)}
            className="btn btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
