import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

export const defaultLanguage =
  localStorage.getItem("healthcare-language") ?? "en";

export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

function updateDocumentLanguage(language: string): void {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
}

updateDocumentLanguage(i18n.resolvedLanguage ?? defaultLanguage);
i18n.on("languageChanged", updateDocumentLanguage);

export default i18n;

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  localStorage.setItem("healthcare-language", language);
};
