import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "staff",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        {
          "use-sync-external-store/shim": {
            packagePath: "use-sync-external-store/shim",
            version: "1.6.0",
          },
        },
      ],
    }),
  ],
  resolve: {
    dedupe: ["i18next", "react-i18next"],
  },
  server: {
    port: 3006,
    strictPort: true,
  },
  preview: {
    port: 3006,
    strictPort: true,
  },
  build: {
    target: "esnext",
  },
});
