import React, { useState } from "react";
import { prescriptionSchema } from "@healthcare-platform/validation";
import type { Medication } from "@healthcare-platform/types";
import type { PrescriptionData } from "../services/prescriptionService";
import "../styles/components.css";

interface PrescriptionFormProps {
  patientName?: string;
  onSubmit: (data: Omit<PrescriptionData, "patientId">) => void;
  loading?: boolean;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patientName = "Unknown",
  onSubmit,
  loading = false,
}) => {
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", notes: "" },
  ]);
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string,
  ) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "", notes: "" },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = prescriptionSchema.safeParse({
      medications,
      instructions,
      notes,
    });

    if (!validation.success) {
      const nextErrors = Object.fromEntries(
        validation.error.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ]),
      );
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(validation.data as Omit<PrescriptionData, "patientId">);
  };

  return (
    <form className="prescription-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h3>Prescription for {patientName}</h3>
      </div>

      <div className="medications-section">
        <h4>Medications</h4>
        {medications.map((med, index) => (
          <div key={index} className="medication-row">
            <div className="form-group">
              <label>Medication Name *</label>
              <input
                type="text"
                value={med.name}
                onChange={(e) =>
                  handleMedicationChange(index, "name", e.target.value)
                }
                placeholder="e.g., Aspirin"
                required
              />
              {errors[`medications.${index}.name`] && (
                <small style={{ color: "#d93025" }}>
                  {errors[`medications.${index}.name`]}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Dosage *</label>
              <input
                type="text"
                value={med.dosage}
                onChange={(e) =>
                  handleMedicationChange(index, "dosage", e.target.value)
                }
                placeholder="e.g., 500mg"
                required
              />
              {errors[`medications.${index}.dosage`] && (
                <small style={{ color: "#d93025" }}>
                  {errors[`medications.${index}.dosage`]}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Frequency *</label>
              <select
                value={med.frequency}
                onChange={(e) =>
                  handleMedicationChange(index, "frequency", e.target.value)
                }
                required
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="Every 12 hours">Every 12 hours</option>
              </select>
              {errors[`medications.${index}.frequency`] && (
                <small style={{ color: "#d93025" }}>
                  {errors[`medications.${index}.frequency`]}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Duration *</label>
              <input
                type="text"
                value={med.duration}
                onChange={(e) =>
                  handleMedicationChange(index, "duration", e.target.value)
                }
                placeholder="e.g., 7 days"
                required
              />
              {errors[`medications.${index}.duration`] && (
                <small style={{ color: "#d93025" }}>
                  {errors[`medications.${index}.duration`]}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                value={med.notes || ""}
                onChange={(e) =>
                  handleMedicationChange(index, "notes", e.target.value)
                }
                placeholder="e.g., After meals"
              />
            </div>

            {medications.length > 1 && (
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => removeMedication(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" className="btn-secondary" onClick={addMedication}>
          + Add Medication
        </button>
      </div>

      <div className="form-group">
        <label>Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter any special instructions for the patient"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Prescription"}
        </button>
      </div>
    </form>
  );
};
