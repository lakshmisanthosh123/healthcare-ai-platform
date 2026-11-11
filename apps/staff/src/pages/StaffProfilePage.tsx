import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@healthcare-platform/ui";
import { ProfileAttachments } from "@healthcare-platform/ui";
import type { ProfileDocument } from "@healthcare-platform/types";
import {
  changePasswordSchema,
  staffProfileSchema,
  type ChangePasswordFormValues,
  type StaffProfileFormValues,
} from "@healthcare-platform/validation";
import { useForm } from "react-hook-form";
import type { Path } from "react-hook-form";
import {
  useChangeStaffPassword,
  useStaffProfile,
  useUpdateStaffProfile,
} from "../hooks/useStaffQueries";
import { useTranslator } from "../hooks/useTranslator";
import { getApiErrorMessage, getApiFieldErrors } from "../services/api";

export function StaffProfilePage() {
  const t = useTranslator();
  const profile = useStaffProfile();
  const updateProfile = useUpdateStaffProfile();
  const changePassword = useChangeStaffPassword();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [avatar, setAvatar] = useState(profile.data?.avatar);
  const [document, setDocument] = useState<ProfileDocument | undefined>(
    profile.data?.document,
  );

  const profileForm = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
    },
  });
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const resetProfileForm = profileForm.reset;

  useEffect(() => {
    if (!profile.data) return;
    resetProfileForm({
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      email: profile.data.email,
      phone: profile.data.phone ?? "",
      jobTitle: profile.data.jobTitle,
      department: profile.data.department,
    });
    setAvatar(profile.data.avatar);
    setDocument(profile.data.document);
  }, [profile.data, resetProfileForm]);

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileMessage("");
    setProfileError("");
    try {
      await updateProfile.mutateAsync({ ...values, avatar, document });
      setProfileMessage(t("staff.profileUpdated"));
    } catch (error) {
      for (const [field, message] of Object.entries(getApiFieldErrors(error))) {
        if (field in values) {
          profileForm.setError(field as Path<StaffProfileFormValues>, {
            type: "server",
            message,
          });
        }
      }
      setProfileError(getApiErrorMessage(error, t("staff.profileError")));
    }
  });

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordMessage("");
    setPasswordError("");
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      setPasswordMessage(t("staff.passwordChanged"));
    } catch (error) {
      for (const [field, message] of Object.entries(getApiFieldErrors(error))) {
        if (field in values) {
          passwordForm.setError(field as Path<ChangePasswordFormValues>, {
            type: "server",
            message,
          });
        }
      }
      setPasswordError(getApiErrorMessage(error, t("staff.passwordError")));
    }
  });

  const profileField = (field: keyof StaffProfileFormValues) =>
    profileForm.formState.errors[field]?.message ? (
      <span className="field-error" role="alert">
        {profileForm.formState.errors[field]?.message}
      </span>
    ) : null;
  const passwordField = (field: keyof ChangePasswordFormValues) =>
    passwordForm.formState.errors[field]?.message ? (
      <span className="field-error" role="alert">
        {passwordForm.formState.errors[field]?.message}
      </span>
    ) : null;

  if (profile.isPending) {
    return (
      <p className="staff-state" role="status">
        {t("staff.loading")}
      </p>
    );
  }
  if (profile.isError) {
    return (
      <div className="staff-alert staff-alert--error" role="alert">
        {getApiErrorMessage(profile.error, t("staff.profileError"))}
        <button type="button" onClick={() => void profile.refetch()}>
          {t("staff.retry")}
        </button>
      </div>
    );
  }

  return (
    <section className="staff-page">
      <header className="staff-page-heading">
        <div>
          {avatar && (
            <img
              className="staff-profile-photo"
              src={avatar}
              alt="Profile photo"
            />
          )}
          <p className="staff-eyebrow">{t("staff.profileTitle")}</p>
          <h1>{t("staff.profileTitle")}</h1>
          <p>{t("staff.profileDescription")}</p>
        </div>
      </header>

      <div className="staff-profile-grid">
        <Card title={t("staff.editProfile")}>
          <form className="staff-form" onSubmit={saveProfile} noValidate>
            <div className="staff-form__grid">
              <label>
                {t("staff.firstName")}
                <input {...profileForm.register("firstName")} />
                {profileField("firstName")}
              </label>
              <label>
                {t("staff.lastName")}
                <input {...profileForm.register("lastName")} />
                {profileField("lastName")}
              </label>
              <label>
                {t("staff.email")}
                <input type="email" {...profileForm.register("email")} />
                {profileField("email")}
              </label>
              <label>
                {t("staff.phone")}
                <input type="tel" {...profileForm.register("phone")} />
                {profileField("phone")}
              </label>
              <label>
                {t("staff.jobTitle")}
                <input {...profileForm.register("jobTitle")} />
                {profileField("jobTitle")}
              </label>
              <label>
                {t("staff.department")}
                <input {...profileForm.register("department")} />
                {profileField("department")}
              </label>
            </div>
            <ProfileAttachments
              avatar={avatar}
              document={document}
              onAvatarChange={setAvatar}
              onDocumentChange={setDocument}
            />
            {profileMessage && (
              <p className="form-message form-message--success" role="status">
                {profileMessage}
              </p>
            )}
            {profileError && (
              <p className="form-message form-message--error" role="alert">
                {profileError}
              </p>
            )}
            <Button
              label={t("staff.saveProfile")}
              type="submit"
              disabled={updateProfile.isPending}
            />
          </form>
        </Card>

        <Card title={t("staff.changePassword")}>
          <form className="staff-form" onSubmit={savePassword} noValidate>
            <label>
              {t("staff.currentPassword")}
              <input
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordField("currentPassword")}
            </label>
            <label>
              {t("staff.newPassword")}
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
              {passwordField("newPassword")}
            </label>
            <label>
              {t("staff.confirmPassword")}
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordField("confirmPassword")}
            </label>
            {passwordMessage && (
              <p className="form-message form-message--success" role="status">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="form-message form-message--error" role="alert">
                {passwordError}
              </p>
            )}
            <Button
              label={t("staff.changePassword")}
              type="submit"
              disabled={changePassword.isPending}
            />
          </form>
        </Card>
      </div>
    </section>
  );
}
