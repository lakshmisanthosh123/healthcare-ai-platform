import { useEffect, useState } from "react";
import { Card, Button, Input, PageHeader } from "@healthcare-platform/ui";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../services/adminService";
import type { AdminSettings } from "../types/admin";
import { getAdminApiErrorMessage } from "../services/api";

export function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminSettings()
      .then((result) => {
        if (active) setSettings(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            getAdminApiErrorMessage(loadError, "Failed to load settings."),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      setSettings(await updateAdminSettings(settings));
      setSuccess("Settings saved successfully.");
    } catch (saveError) {
      setError(getAdminApiErrorMessage(saveError, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p role="status">Loading settings...</p>;
  }

  if (!settings) {
    return (
      <section className="admin-page">
        <PageHeader
          title="Settings"
          subtitle="Tune security defaults and operational preferences."
        />
        {error && <p role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Settings"
        subtitle="Tune security defaults and operational preferences."
        actions={
          <Button
            label={saving ? "Saving..." : "Save changes"}
            variant="primary"
            disabled={saving}
            onClick={() => void saveSettings()}
          />
        }
      />
      <div className="admin-content__body">
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
        <Card
          title="Security configuration"
          description="Core controls for compliance and notifications."
        >
          <div className="admin-form-grid">
            <label>
              <span>Notification email</span>
              <Input
                id="notification-email"
                value={settings.notificationEmail}
                type="email"
                onChange={(notificationEmail) =>
                  setSettings((current) =>
                    current ? { ...current, notificationEmail } : current,
                  )
                }
              />
            </label>
            <label>
              <span>Retention days</span>
              <Input
                id="retention-days"
                value={String(settings.retentionDays)}
                type="number"
                onChange={(value) =>
                  setSettings((current) =>
                    current
                      ? { ...current, retentionDays: Number(value) }
                      : current,
                  )
                }
              />
            </label>
            <label>
              <span>Timezone</span>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(timezone) =>
                  setSettings((current) =>
                    current ? { ...current, timezone } : current,
                  )
                }
              />
            </label>
          </div>
        </Card>
      </div>
    </section>
  );
}
