import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  PageHeader,
  ProfileAttachments,
} from "@healthcare-platform/ui";
import type { ProfileDocument } from "@healthcare-platform/types";
import { getStoredAuthSession } from "@healthcare-platform/utils";
import { useTranslator } from "../hooks/useTranslator";
import { updateAdminProfile } from "../services/adminService";

export function ProfilePage() {
  const t = useTranslator();
  const user = getStoredAuthSession()?.user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar);
  const [document, setDocument] = useState<ProfileDocument | undefined>(
    user?.document,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateAdminProfile({
        name: name.trim(),
        email: email.trim(),
        avatar,
        document,
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Could not update admin profile.", error);
      setMessage("Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-page">
      <PageHeader
        title={t("admin.profile")}
        subtitle={t("admin.profileDescription")}
      />
      <div className="admin-content__body">
        <Card
          title={t("admin.profile")}
          description={t("admin.profileDescription")}
        >
          <form
            className="admin-profile-form"
            onSubmit={(event) => void saveProfile(event)}
          >
            <label>
              {t("admin.name")}
              <input
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              {t("admin.email")}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <p>
              <strong>{t("admin.role")}:</strong>{" "}
              {user?.role ?? t("admin.notAvailable")}
            </p>
            <ProfileAttachments
              avatar={avatar}
              document={document}
              onAvatarChange={setAvatar}
              onDocumentChange={setDocument}
            />
            {message && <p role="status">{message}</p>}
            <Button
              label={saving ? "Saving..." : "Save profile"}
              type="submit"
              disabled={saving}
            />
          </form>
        </Card>
      </div>
    </section>
  );
}
