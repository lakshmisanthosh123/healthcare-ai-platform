import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@healthcare-platform/translator";
import "@healthcare-platform/theme/src/global.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
