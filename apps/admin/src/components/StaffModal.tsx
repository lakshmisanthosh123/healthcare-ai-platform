import { useState, type FormEvent } from "react";
import { useEffect } from "react";
import { Button, Modal } from "@healthcare-platform/ui";
import type { Staff, StaffStatus } from "@healthcare-platform/types";
import type { NewStaffPayload } from "../types/admin";
import "./StaffModal.css";

interface StaffModalProps {
  isOpen: boolean;
  loading: boolean;
  staff?: Staff | null;
  onClose: () => void;
  onSubmit: (
    staff: NewStaffPayload | Omit<NewStaffPayload, "password">,
  ) => Promise<void>;
}

const initialValues: NewStaffPayload = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  employmentStatus: "active",
  hireDate: new Date().toISOString().slice(0, 10),
  password: "",
};

function getSubmissionError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;
      if (
        data &&
        typeof data === "object" &&
        "detail" in data &&
        typeof data.detail === "string"
      ) {
        return data.detail;
      }
    }
  }

  return error instanceof Error ? error.message : "Could not add staff member.";
}

export function StaffModal({
  isOpen,
  loading,
  staff,
  onClose,
  onSubmit,
}: StaffModalProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setValues(
      staff
        ? {
            ...initialValues,
            ...staff,
            employeeId: staff.employeeId ?? "",
            phone: staff.phone ?? "",
            hireDate: staff.hireDate ?? "",
            password: "",
          }
        : initialValues,
    );
    setError("");
  }, [isOpen, staff]);

  const update = (field: keyof NewStaffPayload, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: field === "employmentStatus" ? (value as StaffStatus) : value,
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      if (staff) {
        const { password: ignoredPassword, ...update } = values;
        void ignoredPassword;
        await onSubmit(update);
      } else {
        await onSubmit(values);
      }
      setValues(initialValues);
      onClose();
    } catch (submitError) {
      setError(getSubmissionError(submitError));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={staff ? "Edit Staff Member" : "Add Staff Member"}
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
            form="admin-add-staff"
          >
            {loading ? "Saving..." : staff ? "Save Staff" : "Add Staff"}
          </button>
        </>
      }
    >
      <form
        id="admin-add-staff"
        className="admin-staff-modal-form"
        onSubmit={submit}
      >
        <div className="admin-staff-modal-grid">
          <label>
            <span>First name</span>
            <input
              required
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => update("firstName", event.target.value)}
            />
          </label>
          <label>
            <span>Last name</span>
            <input
              required
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => update("lastName", event.target.value)}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          {!staff && (
            <label>
              <span>Temporary password</span>
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
              />
            </label>
          )}
          <label>
            <span>Phone</span>
            <input
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </label>
          <label>
            <span>Job title</span>
            <input
              required
              value={values.jobTitle}
              onChange={(event) => update("jobTitle", event.target.value)}
            />
          </label>
          <label>
            <span>Department</span>
            <input
              required
              value={values.department}
              onChange={(event) => update("department", event.target.value)}
            />
          </label>
          <label>
            <span>Employee ID</span>
            <input
              value={values.employeeId}
              onChange={(event) => update("employeeId", event.target.value)}
            />
          </label>
          <label>
            <span>Hire date</span>
            <input
              type="date"
              value={values.hireDate}
              onChange={(event) => update("hireDate", event.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={values.employmentStatus}
              onChange={(event) =>
                update("employmentStatus", event.target.value)
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="admin-staff-modal-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
