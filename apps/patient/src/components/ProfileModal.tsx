import { useState, useEffect } from "react";
import { ProfileAttachments } from "@healthcare-platform/ui";
import type { ProfileDocument } from "@healthcare-platform/types";
import { patientSchema } from "@healthcare-platform/validation";
import type { Patient } from "@healthcare-platform/types";
import "../styles/components.css";

interface ProfileModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  loading?: boolean;
}

export const ProfileModal = ({
  isOpen,
  patient,
  onClose,
  onSubmit,
  loading = false,
}: ProfileModalProps) => {
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [avatar, setAvatar] = useState(patient?.avatar);
  const [document, setDocument] = useState<ProfileDocument | undefined>(
    patient?.document,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Patient, string>>>(
    {},
  );

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        address: patient.address,
        avatar: patient.avatar,
        document: patient.document,
      });
      setAvatar(patient.avatar);
      setDocument(patient.document);
    }
  }, [patient, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name as keyof Patient]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = patientSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof Patient, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit({ ...validation.data, avatar, document });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕{errors && <span className="error-indicator">*</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <ProfileAttachments
            avatar={avatar}
            document={document}
            onAvatarChange={(value) => {
              setAvatar(value);
              setFormData((previous) => ({ ...previous, avatar: value }));
            }}
            onDocumentChange={(value) => {
              setDocument(value);
              setFormData((previous) => ({ ...previous, document: value }));
            }}
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={
                  formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodType">Blood Type</label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType || ""}
                onChange={handleChange}
              >
                <option value="">Select blood type</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
