# @healthcare-ai-platform/theme

Design tokens and theme helpers for microfrontends.

## Install

No runtime dependencies. Import files directly.

## Usage

Import CSS and apply a theme in your app entry (Shell):

```tsx
import "@healthcare-ai-platform/theme/src/global.css";
import {
  lightTheme,
  darkTheme,
  applyTheme,
} from "@healthcare-ai-platform/theme";

// apply default
applyTheme(lightTheme);

// to toggle
// applyTheme(darkTheme);
```

### Example: Shell

- Import global styles and apply a theme early (e.g. `src/main.tsx`).

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@healthcare-ai-platform/theme/src/global.css";
import { lightTheme, applyTheme } from "@healthcare-ai-platform/theme";

applyTheme(lightTheme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Example: Auth

```tsx
import { applyTheme, darkTheme } from "@healthcare-ai-platform/theme";
applyTheme(darkTheme);
```

### Example: Dashboard, Patient, Doctor, Admin

They all import tokens or rely on global CSS variables for consistent spacing and colors, e.g.:

```tsx
import { spacing, typography } from "@healthcare-ai-platform/theme";

function Header() {
  return <div style={{ padding: spacing.md }}>{/* ... */}</div>;
}
```

Note: For CSS-in-JS approaches, read tokens from the exported objects.
