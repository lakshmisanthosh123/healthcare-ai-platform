import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Modal } from "@healthcare-platform/ui";
import { useForm } from "react-hook-form";
import type { Staff } from "@healthcare-platform/types";
import {
  staffSchema,
  type StaffFormValues,
} from "@healthcare-platform/validation";
import { useTranslator } from "../hooks/useTranslator";
import { getApiErrorMessage, getApiFieldErrors } from "../services/api";

interface StaffFormProps {
  isOpen: boolean;
  staff: Staff;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: StaffFormValues) => Promise<void>;
}

const emptyValues: StaffFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  employmentStatus: "active",
  employeeId: "",
  hireDate: "",
};

export function StaffForm({
  isOpen,
  staff,
  isPending,
  onClose,
  onSubmit,
}: StaffFormProps) {
  const t = useTranslator();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone ?? "",
      jobTitle: staff.jobTitle,
      department: staff.department,
      employmentStatus: staff.employmentStatus,
      employeeId: staff.employeeId ?? "",
      hireDate: staff.hireDate ?? "",
    });
    setSubmitError("");
  }, [isOpen, reset, staff]);

  const submit = async (values: StaffFormValues) => {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field in emptyValues) {
          setError(field as keyof StaffFormValues, {
            type: "server",
            message,
          });
        }
      }
      setSubmitError(getApiErrorMessage(error, t("staff.loadError")));
    }
  };

  const errorFor = (field: keyof StaffFormValues) =>
    errors[field]?.message ? (
      <span className="field-error" role="alert">
        {errors[field]?.message}
      </span>
    ) : null;

  return (
    <Modal
      isOpen={isOpen}
      title={t("staff.editStaff")}
      onClose={onClose}
      footer={
        <div className="staff-form__actions">
          <Button
            label={t("staff.cancel")}
            variant="secondary"
            disabled={isPending}
            onClick={onClose}
          />
          <button
            className="staff-button staff-button--primary"
            type="submit"
            form="staff-record-form"
            disabled={isPending}
          >
            {t("staff.save")}
          </button>
        </div>
      }
    >
      <form
        id="staff-record-form"
        className="staff-form"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <div className="staff-form__grid">
          <label>
            {t("staff.firstName")}
            <input id="staff-first-name" {...register("firstName")} />
            {errorFor("firstName")}
          </label>
          <label>
            {t("staff.lastName")}
            <input id="staff-last-name" {...register("lastName")} />
            {errorFor("lastName")}
          </label>
          <label>
            {t("staff.email")}
            <input type="email" autoComplete="email" {...register("email")} />
            {errorFor("email")}
          </label>
          <label>
            {t("staff.phone")}
            <input type="tel" autoComplete="tel" {...register("phone")} />
            {errorFor("phone")}
          </label>
          <label>
            {t("staff.jobTitle")}
            <input {...register("jobTitle")} />
            {errorFor("jobTitle")}
          </label>
          <label>
            {t("staff.department")}
            <input {...register("department")} />
            {errorFor("department")}
          </label>
          <label>
            {t("staff.employeeId")}
            <input {...register("employeeId")} />
            {errorFor("employeeId")}
          </label>
          <label>
            {t("staff.hireDate")}
            <input type="date" {...register("hireDate")} />
            {errorFor("hireDate")}
          </label>
          <label>
            {t("staff.status")}
            <select {...register("employmentStatus")}>
              <option value="active">{t("staff.active")}</option>
              <option value="inactive">{t("staff.inactive")}</option>
              <option value="on_leave">{t("staff.onLeave")}</option>
            </select>
            {errorFor("employmentStatus")}
          </label>
        </div>
        {submitError && (
          <p className="form-message form-message--error" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </Modal>
  );
}
