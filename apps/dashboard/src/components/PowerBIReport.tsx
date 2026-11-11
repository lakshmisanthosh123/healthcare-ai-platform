import { useEffect, useMemo, useState } from "react";
import { PowerBIEmbed, type EventHandler } from "powerbi-client-react";
import { models, type IReportEmbedConfiguration } from "powerbi-client";
import { getPowerBIEmbedConfig } from "../services/dashboardService";
import type { PowerBIEmbedConfig } from "../types/dashboard";
import "./PowerBIReport.css";

const refreshBufferMs = 5 * 60 * 1000;
const fallbackRefreshMs = 45 * 60 * 1000;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load the Power BI report.";
}

export function PowerBIReport() {
  const [config, setConfig] = useState<PowerBIEmbedConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let refreshTimer: number | undefined;

    const loadConfig = async () => {
      try {
        const nextConfig = await getPowerBIEmbedConfig();
        if (!active) return;
        setConfig(nextConfig);
        setError(null);
        const expiration = nextConfig.expiration
          ? Date.parse(nextConfig.expiration)
          : Number.NaN;
        const refreshIn = Number.isFinite(expiration)
          ? Math.max(expiration - Date.now() - refreshBufferMs, 30_000)
          : fallbackRefreshMs;
        refreshTimer = window.setTimeout(
          () => setRetry((current) => current + 1),
          refreshIn,
        );
      } catch (requestError: unknown) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    void loadConfig();
    return () => {
      active = false;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [retry]);

  const eventHandlers = useMemo(
    () =>
      new Map<string, EventHandler>([
        [
          "error",
          () => setError("Power BI could not display the configured report."),
        ],
      ]),
    [],
  );

  const embedConfig: IReportEmbedConfiguration | null = config
    ? {
        type: "report",
        id: config.reportId,
        embedUrl: config.embedUrl,
        accessToken: config.accessToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true },
          },
        },
      }
    : null;

  return (
    <section className="powerbi-report" aria-label="Power BI report">
      <header className="powerbi-report__header">
        <div>
          <h2>Power BI report</h2>
          <p>Interactive report embedded from your Power BI workspace.</p>
        </div>
        {error && (
          <button
            className="powerbi-report__retry"
            type="button"
            onClick={() => setRetry((current) => current + 1)}
          >
            Retry
          </button>
        )}
      </header>
      {loading && <p role="status">Connecting to Power BI...</p>}
      {error && (
        <p className="powerbi-report__error" role="alert">
          {error}
        </p>
      )}
      {embedConfig && (
        <PowerBIEmbed
          embedConfig={embedConfig}
          eventHandlers={eventHandlers}
          cssClassName="powerbi-report__frame"
        />
      )}
    </section>
  );
}
