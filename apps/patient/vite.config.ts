import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),

    federation({
      name: "patient",
      filename: "remoteEntry.js",

      exposes: {
        "./App": "./src/App.tsx",
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
      ],
    }),
  ],

  server: {
    port: 3003,
    strictPort: true,
  },

  preview: {
    port: 3003,
    strictPort: true,
  },

  build: {
    target: "esnext",
  },
});
