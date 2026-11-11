import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getFrontendPortBase } from "./dev-ports.mjs";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const virtualEnvPython = resolve(
  projectRoot,
  ".venv",
  process.platform === "win32" ? "Scripts" : "bin",
  process.platform === "win32" ? "python.exe" : "python",
);
const pythonCommand = existsSync(virtualEnvPython)
  ? virtualEnvPython
  : process.platform === "win32"
    ? "py"
    : "python3";
const pythonArgs = pythonCommand === "py" ? ["-3"] : [];
const env = { ...process.env };
const hasPostgresConfig = [
  "PGHOST",
  "PGPORT",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
].some((key) => env[key]);

if (!env.DJANGO_SQLITE_NAME && !hasPostgresConfig) {
  env.DJANGO_SQLITE_NAME = resolve(
    projectRoot,
    "backend",
    "django",
    "learning.sqlite3",
  );
}

function runCommand(command, args, options = {}) {
  return new Promise((resolveExit) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env,
      stdio: "inherit",
      shell: process.platform === "win32" && command === "pnpm",
      ...options,
    });
    child.once("error", (error) => {
      console.error(`Unable to start ${command}:`, error);
      resolveExit(1);
    });
    child.once("exit", (code) => resolveExit(code ?? 1));
  });
}

const migrationExitCode = await runCommand(pythonCommand, [
  ...pythonArgs,
  "backend/django/manage.py",
  "migrate",
  "--noinput",
]);

if (migrationExitCode !== 0) {
  process.exitCode = migrationExitCode;
} else {
  const children = [];
  let stopping = false;
  const backendOnly = process.argv.includes("--backend-only");

  const stop = (exitCode = 0) => {
    if (stopping) return;
    stopping = true;
    process.exitCode = exitCode;
    for (const child of children) child.kill();
  };

  const start = (command, args, { stopOnExit = true, ...options } = {}) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env,
      stdio: "inherit",
      shell: process.platform === "win32" && command === "pnpm",
      ...options,
    });
    children.push(child);
    child.once("error", (error) => {
      console.error(`Unable to start ${command}:`, error);
      if (stopOnExit) stop(1);
    });
    child.once("exit", (code) => {
      if (stopping) return;
      if (stopOnExit) {
        stop(code ?? 1);
      } else {
        console.error(
          `Frontend process stopped with exit code ${code ?? 1}; backend APIs remain available.`,
        );
      }
    });
  };

  process.on("SIGINT", () => stop(0));
  process.on("SIGTERM", () => stop(0));

  console.log("Starting Django API at http://127.0.0.1:8001");
  start(pythonCommand, [
    ...pythonArgs,
    "backend/django/manage.py",
    "runserver",
    "127.0.0.1:8001",
  ]);
  console.log("Starting FastAPI at http://127.0.0.1:8000");
  start(pythonCommand, [
    ...pythonArgs,
    "-m",
    "uvicorn",
    "backend.fastapi.main:app",
    "--reload",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
  ]);
  if (!backendOnly) {
    const portBase = await getFrontendPortBase();
    const appPorts = {
      shell: portBase,
      auth: portBase + 1,
      dashboard: portBase + 2,
      patient: portBase + 3,
      doctor: portBase + 4,
      admin: portBase + 5,
      staff: portBase + 6,
    };
    const appUrls = Object.fromEntries(
      Object.entries(appPorts).map(([name, port]) => [
        name,
        `http://localhost:${port}`,
      ]),
    );
    const frontendEnv = {
      VITE_SHELL_URL: process.env.VITE_SHELL_URL ?? `${appUrls.shell}/`,
      VITE_AUTH_URL: process.env.VITE_AUTH_URL ?? `${appUrls.auth}/login`,
      VITE_DASHBOARD_URL:
        process.env.VITE_DASHBOARD_URL ?? `${appUrls.dashboard}/`,
      VITE_PATIENT_URL: process.env.VITE_PATIENT_URL ?? `${appUrls.patient}/`,
      VITE_DOCTOR_URL: process.env.VITE_DOCTOR_URL ?? `${appUrls.doctor}/`,
      VITE_ADMIN_URL: process.env.VITE_ADMIN_URL ?? `${appUrls.admin}/`,
      VITE_STAFF_URL: process.env.VITE_STAFF_URL ?? `${appUrls.staff}/`,
      VITE_AUTH_REMOTE_URL: process.env.VITE_AUTH_REMOTE_URL ?? appUrls.auth,
      VITE_DASHBOARD_REMOTE_URL:
        process.env.VITE_DASHBOARD_REMOTE_URL ?? appUrls.dashboard,
      VITE_PATIENT_REMOTE_URL:
        process.env.VITE_PATIENT_REMOTE_URL ?? appUrls.patient,
      VITE_DOCTOR_REMOTE_URL:
        process.env.VITE_DOCTOR_REMOTE_URL ?? appUrls.doctor,
      VITE_ADMIN_REMOTE_URL: process.env.VITE_ADMIN_REMOTE_URL ?? appUrls.admin,
      VITE_STAFF_REMOTE_URL: process.env.VITE_STAFF_REMOTE_URL ?? appUrls.staff,
    };
    const remoteApps = [
      "auth",
      "dashboard",
      "patient",
      "doctor",
      "admin",
      "staff",
    ];
    const getAppEnv = (app) => ({
      ...env,
      ...frontendEnv,
      VITE_API_URL: process.env.VITE_API_URL ?? "http://127.0.0.1:8001",
      VITE_API_BASE_URL:
        process.env.VITE_API_BASE_URL ??
        (app === "admin"
          ? "http://127.0.0.1:8001/api"
          : "http://127.0.0.1:8000/api"),
      VITE_DASHBOARD_API_URL:
        process.env.VITE_DASHBOARD_API_URL ?? "http://127.0.0.1:8000/dashboard",
    });
    console.log(
      `Building frontend remotes for ports ${portBase + 1}-${portBase + 6}`,
    );
    const remoteBuildResults = await Promise.all(
      remoteApps.map((app) =>
        runCommand(
          "pnpm",
          [`--filter=./apps/${app}`, "exec", "vite", "build"],
          { env: getAppEnv(app) },
        ),
      ),
    );
    const failedBuild = remoteBuildResults.find((code) => code !== 0);
    if (failedBuild !== undefined) {
      stop(failedBuild);
    } else {
      console.log(
        `Starting frontend apps on ports ${portBase}-${portBase + 6}`,
      );
      for (const app of remoteApps) {
        const port = appPorts[app];
        const appEnv = getAppEnv(app);
        console.log(`${app}: ${appUrls[app]}`);
        start(
          "pnpm",
          [
            `--filter=./apps/${app}`,
            "exec",
            "vite",
            "preview",
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
            "--strictPort",
          ],
          { stopOnExit: false, env: appEnv },
        );
        start(
          "pnpm",
          [`--filter=./apps/${app}`, "exec", "vite", "build", "--watch"],
          { stopOnExit: false, env: appEnv },
        );
      }
      const shellEnv = getAppEnv("shell");
      console.log(`shell: ${appUrls.shell}`);
      start(
        "pnpm",
        [
          "--filter=./apps/shell",
          "exec",
          "vite",
          "--host",
          "127.0.0.1",
          "--port",
          String(appPorts.shell),
          "--strictPort",
        ],
        { stopOnExit: false, env: shellEnv },
      );
    }
  } else {
    console.log("Backend APIs are running. Press Ctrl+C to stop them.");
  }
}
