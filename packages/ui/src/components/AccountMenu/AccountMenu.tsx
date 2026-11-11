import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  changeLanguage,
  default as translator,
  supportedLanguages,
} from "@healthcare-platform/translator";
import "./AccountMenu.css";

const subscribeToLanguage = (onChange: () => void) => {
  translator.on("languageChanged", onChange);
  return () => translator.off("languageChanged", onChange);
};

const getLanguage = () => translator.language;

export interface AccountMenuProps {
  userName?: string;
  email?: string;
  logoutLabel: string;
  onLogout: () => void;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "U";
}

export function AccountMenu({
  userName,
  email,
  logoutLabel,
  onLogout,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = userName?.trim() || email?.trim() || "Account";
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguage,
    getLanguage,
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className="account-menu__trigger"
        type="button"
        aria-label={`${displayName} account menu`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {getInitials(displayName)}
        </span>
      </button>
      {isOpen && (
        <div className="account-menu__panel" role="menu">
          <div className="account-menu__identity">
            <strong>{displayName}</strong>
            {email && <span>{email}</span>}
          </div>
          <button
            type="button"
            role="menuitem"
            aria-expanded={isLanguageOpen}
            onClick={() => setIsLanguageOpen((open) => !open)}
          >
            {translator.t("common.language")}: {language.toUpperCase()}
          </button>
          {isLanguageOpen && (
            <div className="account-menu__languages" role="group">
              {supportedLanguages.map((option) => (
                <button
                  type="button"
                  key={option.code}
                  aria-pressed={language === option.code}
                  onClick={() => {
                    void changeLanguage(option.code);
                    setIsLanguageOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
