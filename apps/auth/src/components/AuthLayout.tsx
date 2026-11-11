import { type ReactNode } from "react";
import { PageHeader } from "@healthcare-platform/ui";
import {
  changeLanguage,
  default as translator,
  defaultLanguage,
  supportedLanguages,
} from "@healthcare-platform/translator";
import { useTranslator } from "../hooks/useTranslator";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const t = useTranslator();
  const language =
    translator.language ?? translator.resolvedLanguage ?? defaultLanguage;

  const handleLanguageToggle = async () => {
    const currentIndex = supportedLanguages.findIndex(
      (languageOption) => languageOption.code === language,
    );
    const nextLanguage =
      supportedLanguages[(currentIndex + 1) % supportedLanguages.length];
    await changeLanguage(nextLanguage.code);
  };

  return (
    <div className="auth-shell">
      <aside className="auth-shell__sidebar">
        <div>
          <h2>{t("login.title")}</h2>
        </div>
      </aside>
      <main className="auth-shell__content">
        <div className="auth-shell__topbar">
          <PageHeader title={title} subtitle={description} />
          <button
            className="auth-shell__language-toggle"
            type="button"
            onClick={() => void handleLanguageToggle()}
            aria-label={t("common.changeLanguage")}
            title={t("common.changeLanguage")}
          >
            {language.toUpperCase()}
          </button>
        </div>
        <div className="auth-shell__body">{children}</div>
      </main>
    </div>
  );
}
