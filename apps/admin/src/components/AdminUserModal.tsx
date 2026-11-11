import { useEffect, useState, type FormEvent } from "react";
import { Button, Modal } from "@healthcare-platform/ui";
import type { NewAdminUserPayload } from "../types/admin";
import { getAdminApiErrorMessage } from "../services/api";

interface AdminUserModalProps {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: NewAdminUserPayload) => Promise<void>;
}

const initialValues: NewAdminUserPayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function AdminUserModal({
  isOpen,
  loading,
  onClose,
  onSubmit,
}: AdminUserModalProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setError("");
    }
  }, [isOpen]);

  const update = (field: keyof NewAdminUserPayload, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onSubmit(values);
      setValues(initialValues);
      onClose();
    } catch (submitError) {
      setError(
        getAdminApiErrorMessage(submitError, "Could not create admin account."),
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Admin Account"
      onClose={onClose}
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
            form="admin-create-account"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </>
      }
    >
      <form
        id="admin-create-account"
        className="admin-form-grid"
        onSubmit={submit}
      >
        <label>
          First name
          <input
            required
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) => update("firstName", event.target.value)}
          />
        </label>
        <label>
          Last name
          <input
            required
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) => update("lastName", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label>
          Temporary password
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
          />
        </label>
        <p>
          The new administrator can sign in to the admin module with this email
          and password.
        </p>
        {error && (
          <p className="admin-users__error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
