import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = resolve(projectRoot, "dist");
const shellOrigin = (
  process.env.URL ??
  process.env.DEPLOY_PRIME_URL ??
  process.env.NETLIFY_SITE_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");
const djangoApiUrl =
  process.env.NETLIFY_DJANGO_API_URL ??
  "https://healthcare-django-api.onrender.com";
const fastApiUrl =
  process.env.NETLIFY_FASTAPI_API_URL ??
  "https://healthcare-fastapi-api.onrender.com";
const remoteApps = ["auth", "dashboard", "patient", "doctor", "admin", "staff"];

function build(app, args, extraEnv = {}) {
  const result = spawnSync(
    "pnpm",
    [`--filter=./apps/${app}`, "exec", "vite", "build", ...args],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        VITE_API_URL: djangoApiUrl,
        VITE_API_BASE_URL:
          app === "admin" ? `${djangoApiUrl}/api` : `${fastApiUrl}/api`,
        VITE_DASHBOARD_API_URL: `${fastApiUrl}/dashboard`,
        VITE_SHELL_URL: `${shellOrigin}/`,
        VITE_AUTH_URL: `${shellOrigin}/login`,
        VITE_DASHBOARD_URL: `${shellOrigin}/dashboard`,
        VITE_PATIENT_URL: `${shellOrigin}/`,
        VITE_DOCTOR_URL: `${shellOrigin}/`,
        VITE_ADMIN_URL: `${shellOrigin}/`,
        VITE_STAFF_URL: `${shellOrigin}/`,
        ...extraEnv,
      },
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Building the ${app} frontend failed.`);
  }
}

build("shell", ["--base=/"], {
  VITE_AUTH_REMOTE_URL: `${shellOrigin}/remotes/auth`,
  VITE_DASHBOARD_REMOTE_URL: `${shellOrigin}/remotes/dashboard`,
  VITE_PATIENT_REMOTE_URL: `${shellOrigin}/remotes/patient`,
  VITE_DOCTOR_REMOTE_URL: `${shellOrigin}/remotes/doctor`,
  VITE_ADMIN_REMOTE_URL: `${shellOrigin}/remotes/admin`,
  VITE_STAFF_REMOTE_URL: `${shellOrigin}/remotes/staff`,
});

const shellOutputDirectory = resolve(projectRoot, "apps", "shell", "dist");
rmSync(outputDirectory, { recursive: true, force: true });
cpSync(shellOutputDirectory, outputDirectory, { recursive: true });

for (const app of remoteApps) {
  build(app, [`--base=/remotes/${app}/`]);
  const appOutputDirectory = resolve(projectRoot, "apps", app, "dist");
  const remoteOutputDirectory = resolve(outputDirectory, "remotes", app);
  mkdirSync(remoteOutputDirectory, { recursive: true });
  cpSync(appOutputDirectory, remoteOutputDirectory, { recursive: true });
}
