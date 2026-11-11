# @healthcare-ai-platform/translator

A reusable translator package for React TypeScript microfrontend apps.

## Package Contents

- `src/locales/en.json`
- `src/locales/fr.json`
- `src/locales/ar.json`
- `src/i18n.ts`
- `src/index.ts`

## Installation

Install peer dependencies in each app:

```bash
pnpm add react-i18next i18next
```

## Usage

Initialize translator in your application root or entry component:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { i18n } from "@healthcare-ai-platform/translator";

// i18n is initialized on import, no extra setup is required here.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Use translations in components with `useTranslation`:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <form>
      <h1>{t("login.title")}</h1>
      <label>{t("login.email")}</label>
      <input type="email" />
      <button>{t("login.submit")}</button>
    </form>
  );
};

export default LoginPage;
```

## Language Switcher Example

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  supportedLanguages,
  changeLanguage,
} from "@healthcare-ai-platform/translator";

const LanguageSwitcher = () => {
  const { t } = useTranslation();

  return (
    <div>
      <label>{t("common.language")}</label>
      <select onChange={(event) => changeLanguage(event.target.value)}>
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
```

## App-specific Usage

### Shell

```tsx
import {
  supportedLanguages,
  changeLanguage,
} from "@healthcare-ai-platform/translator";
```

### Auth

```tsx
import { useTranslation } from "react-i18next";
```

### Dashboard

```tsx
import { useTranslation } from "react-i18next";
```

### Patient

```tsx
import { useTranslation } from "react-i18next";
```

### Doctor

```tsx
import { useTranslation } from "react-i18next";
```

### Admin

```tsx
import { useTranslation } from "react-i18next";
```
