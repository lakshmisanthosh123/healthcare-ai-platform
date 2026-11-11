import { useState, useEffect, type FormEvent } from "react";
import { Button, Modal } from "@healthcare-platform/ui";
import type { Doctor } from "@healthcare-platform/types";
import type { NewDoctorPayload } from "../types/admin";
import "./DoctorModal.css";

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSubmit: (data: NewDoctorPayload | Partial<Doctor>) => Promise<void>;
  loading?: boolean;
}

const initialForm: Partial<Doctor> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialty: "",
  department: "",
  yearsOfExperience: 0,
  licenseNumber: "",
  gender: undefined,
  address: "",
  bio: "",
  consultationFee: 0,
  languages: [],
  isActive: true,
};

export const DoctorModal = ({
  isOpen,
  onClose,
  doctor,
  onSubmit,
  loading = false,
}: DoctorModalProps) => {
  const [formData, setFormData] = useState<Partial<Doctor>>(initialForm);
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(
        doctor
          ? { ...initialForm, ...doctor, languages: doctor.languages ?? [] }
          : { ...initialForm, languages: [] },
      );
      setPassword("");
      setSubmitError("");
    }
  }, [isOpen, doctor]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "yearsOfExperience" || name === "consultationFee"
          ? Number(value)
          : value,
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: (prev.languages ?? []).includes(lang)
        ? (prev.languages ?? []).filter((language) => language !== lang)
        : [...(prev.languages ?? []), lang],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    try {
      if (doctor) {
        await onSubmit({ ...formData, languages: formData.languages ?? [] });
      } else {
        await onSubmit({
          ...formData,
          languages: formData.languages ?? [],
          password,
        });
      }
      setFormData({ ...initialForm, languages: [] });
      setPassword("");
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : `Could not ${doctor ? "update" : "add"} doctor.`,
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={doctor ? "Edit Doctor" : "Add New Doctor"}
      onClose={onClose}
      className="ui-modal--wide"
      footer={
        <>
          <Button
            label="Cancel"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          />
          <button
            className="ui-button ui-button--primary"
            type="submit"
            disabled={loading}
            form="admin-add-doctor"
          >
            {loading ? "Saving..." : doctor ? "Save Doctor" : "Add Doctor"}
          </button>
        </>
      }
    >
      <form
        id="admin-add-doctor"
        className="admin-doctor-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-doctor-form-grid">
          <label>
            <span>First Name *</span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Last Name *</span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="admin-doctor-form-grid">
          <label>
            <span>Email *</span>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
            />
          </label>
          {!doctor && (
            <label>
              <span>Temporary password *</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}
          <label>
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="admin-doctor-form-grid">
          <label>
            <span>Specialty *</span>
            <input
              type="text"
              name="specialty"
              value={formData.specialty || ""}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Department</span>
            <input
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="admin-doctor-form-grid">
          <label>
            <span>License Number</span>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            <span>Years of Experience</span>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience || 0}
              onChange={handleChange}
              min="0"
            />
          </label>
        </div>

        <div className="admin-doctor-form-grid">
          <label>
            <span>Gender</span>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
          <label>
            <span>Consultation Fee</span>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee || 0}
              onChange={handleChange}
              min="0"
            />
          </label>
        </div>

        <label>
          <span>Address</span>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          <span>Bio</span>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <fieldset className="admin-doctor-form__languages">
          <legend>Languages</legend>
          <div className="admin-doctor-form__language-options">
            {["English", "Spanish", "French", "Arabic", "Chinese", "Hindi"].map(
              (lang) => (
                <label key={lang}>
                  <input
                    type="checkbox"
                    checked={(formData.languages ?? []).includes(lang)}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  {lang}
                </label>
              ),
            )}
          </div>
        </fieldset>

        <label className="admin-doctor-form__active">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive || false}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span>Active</span>
        </label>

        {submitError && (
          <p className="admin-doctor-form__error" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </Modal>
  );
};
