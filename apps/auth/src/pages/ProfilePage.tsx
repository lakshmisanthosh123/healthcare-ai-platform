import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, ProfileAttachments } from "@healthcare-platform/ui";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { logout, useAuth } from "../context/AuthContext";
import { useAppDispatch } from "../store/hooks";
import {
  logout as requestLogout,
  updateCurrentProfile,
} from "../services/authService";
import { profileUpdated } from "../features/auth/authSlice";
import type { ProfileDocument } from "@healthcare-platform/types";

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar);
  const [document, setDocument] = useState<ProfileDocument | undefined>(
    profile?.document,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setAvatar(profile.avatar);
    setDocument(profile.document);
  }, [profile]);

  if (!profile) {
    return null;
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updatedProfile = await updateCurrentProfile({
        name: name.trim(),
        email: email.trim(),
        avatar,
        document,
      });
      dispatch(profileUpdated(updatedProfile));
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Could not update profile.", error);
      setMessage("Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      title="Profile"
      description="Review your identity and role details."
    >
      <Card
        title="Your profile"
        description="Your current account information."
      >
        <form
          className="profile-card"
          onSubmit={(event) => void saveProfile(event)}
        >
          <label>
            Name
            <input
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <p>Role: {profile.role}</p>
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
          <Button
            label="Logout"
            variant="secondary"
            onClick={async () => {
              try {
                await requestLogout();
              } catch (error) {
                console.error("Could not complete server logout.", error);
                window.alert(
                  "The server could not confirm logout. Your local session was cleared.",
                );
              } finally {
                dispatch(logout());
                navigate("/login");
              }
            }}
          />
        </form>
      </Card>
    </AuthLayout>
  );
}
