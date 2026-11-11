import React, { useState } from "react";
import { ProfileAttachments } from "@healthcare-platform/ui";
import type { ProfileDocument } from "@healthcare-platform/types";
import { doctorSchema } from "@healthcare-platform/validation";
import type { Doctor } from "@healthcare-platform/types";
import "../styles/components.css";

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface ProfileModalProps {
  isOpen: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onSubmit: (data: Partial<Doctor>) => void;
  loading?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Doctor>>(doctor || {});
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    doctor?.languages || [],
  );
  const [availability, setAvailability] = useState<
    Array<{ day: string; from: string; to: string }>
  >([]);
  const [scheduleEdited, setScheduleEdited] = useState(false);
  const [avatar, setAvatar] = useState(doctor?.avatar);
  const [document, setDocument] = useState<ProfileDocument | undefined>(
    doctor?.document,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Doctor, string>>>(
    {},
  );

  React.useEffect(() => {
    if (doctor) {
      setFormData(doctor);
      setSelectedLanguages(doctor.languages || []);
      setAvailability(
        (doctor.availability || []).filter(
          (entry): entry is { day: string; from: string; to: string } =>
            typeof entry !== "string" &&
            Boolean(entry.day && entry.from && entry.to),
        ),
      );
      setScheduleEdited(false);
      setAvatar(doctor.avatar);
      setDocument(doctor.document);
    }
  }, [doctor, isOpen]);

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
    setErrors((prev) => ({ ...prev, [name as keyof Doctor]: undefined }));
  };

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = doctorSchema.safeParse({
      ...formData,
      languages: selectedLanguages,
      availability: scheduleEdited ? availability : formData.availability,
    });

    if (!validation.success) {
      const fieldErrors = Object.fromEntries(
        validation.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<keyof Doctor, string>>;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit({
      ...validation.data,
      avatar,
      document,
    } as Partial<Doctor>);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>
            ×{errors && <span className="error-indicator">*</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Specialty</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty || ""}
                onChange={handleChange}
                placeholder="e.g., Cardiology"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience || 0}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
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
            </div>

            <div className="form-group">
              <label>Consultation Fee</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee || 0}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Brief professional bio"
            />
          </div>

          <fieldset className="form-group">
            <legend>Appointment availability</legend>
            <p>Choose the days and hours patients can book with you.</p>
            {weekdays.map((day) => {
              const hours = availability.find((entry) => entry.day === day);
              return (
                <div className="form-row" key={day}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(hours)}
                      onChange={(event) => {
                        setScheduleEdited(true);
                        setAvailability((previous) =>
                          event.target.checked
                            ? [...previous, { day, from: "09:00", to: "17:00" }]
                            : previous.filter((entry) => entry.day !== day),
                        );
                      }}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                  {hours && (
                    <>
                      <input
                        aria-label={`${day} start time`}
                        type="time"
                        value={hours.from}
                        onChange={(event) => {
                          setScheduleEdited(true);
                          setAvailability((previous) =>
                            previous.map((entry) =>
                              entry.day === day
                                ? { ...entry, from: event.target.value }
                                : entry,
                            ),
                          );
                        }}
                      />
                      <input
                        aria-label={`${day} end time`}
                        type="time"
                        value={hours.to}
                        onChange={(event) => {
                          setScheduleEdited(true);
                          setAvailability((previous) =>
                            previous.map((entry) =>
                              entry.day === day
                                ? { ...entry, to: event.target.value }
                                : entry,
                            ),
                          );
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
            {errors.availability && <p role="alert">{errors.availability}</p>}
          </fieldset>

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

          <div className="form-group">
            <label>Languages</label>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              {[
                "English",
                "Spanish",
                "French",
                "Arabic",
                "Chinese",
                "Hindi",
              ].map((lang) => (
                <label key={lang} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
