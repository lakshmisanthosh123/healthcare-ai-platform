import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        auth: `${process.env.VITE_AUTH_REMOTE_URL ?? "http://localhost:3001"}/assets/remoteEntry.js`,
        dashboard: `${process.env.VITE_DASHBOARD_REMOTE_URL ?? "http://localhost:3002"}/assets/remoteEntry.js`,
        patient: `${process.env.VITE_PATIENT_REMOTE_URL ?? "http://localhost:3003"}/assets/remoteEntry.js`,
        doctor: `${process.env.VITE_DOCTOR_REMOTE_URL ?? "http://localhost:3004"}/assets/remoteEntry.js`,
        admin: `${process.env.VITE_ADMIN_REMOTE_URL ?? "http://localhost:3005"}/assets/remoteEntry.js`,
        staff: `${process.env.VITE_STAFF_REMOTE_URL ?? "http://localhost:3006"}/assets/remoteEntry.js`,
      },

      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        {
          "use-sync-external-store/with-selector.js": {
            packagePath: "use-sync-external-store/with-selector.js",
            version: "1.6.0",
          },
        },
        {
          "use-sync-external-store/shim": {
            packagePath: "use-sync-external-store/shim",
            version: "1.6.0",
          },
        },
      ],
    }),
  ],

  server: {
    port: 3000,
    strictPort: true,
  },

  preview: {
    port: 3000,
    strictPort: true,
  },

  build: {
    target: "esnext",
  },
});
