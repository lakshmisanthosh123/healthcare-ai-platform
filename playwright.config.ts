import { defineConfig, devices } from "@playwright/test";
import { getFrontendPortBase } from "./scripts/dev-ports.mjs";

const portBase = await getFrontendPortBase();
process.env.HEALTHCARE_PORT_BASE = String(portBase);
const shellUrl = `http://localhost:${portBase}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: shellUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: `${shellUrl}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
