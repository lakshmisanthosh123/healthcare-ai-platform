import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),

    federation({
      name: "dashboard",
      filename: "remoteEntry.js",

      exposes: {
        "./App": "./src/App.tsx",
      },

      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],

  server: {
    port: 3002,
    strictPort: true,
  },

  preview: {
    port: 3002,
    strictPort: true,
  },

  build: {
    target: "esnext",
  },
});
