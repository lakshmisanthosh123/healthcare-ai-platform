import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./PortalShell.css";

interface PortalShellProps {
  brand: string;
  subtitle: string;
  navigationLabel: string;
  homeHref: string;
  children: ReactNode;
  navigation: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
}

export function PortalShell({
  brand,
  subtitle,
  navigationLabel,
  homeHref,
  children,
  navigation,
  actions,
  footer,
  contentClassName = "",
}: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="portal-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="portal-shell__scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`portal-shell__sidebar${sidebarOpen ? " is-open" : ""}`}
      >
        <NavLink
          className="portal-shell__brand"
          to={homeHref}
          aria-label={`${brand} home`}
        >
          <span className="portal-shell__brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            <strong>{brand}</strong>
            <small>{subtitle}</small>
          </span>
        </NavLink>
        <nav className="portal-shell__nav" aria-label={navigationLabel}>
          {navigation}
        </nav>
        {footer && <div className="portal-shell__footer">{footer}</div>}
      </aside>

      <div className="portal-shell__main">
        <header className="portal-shell__topbar">
          <button
            type="button"
            className="portal-shell__menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="portal-shell__context">{brand}</span>
          <div className="portal-shell__actions">{actions}</div>
        </header>
        <main className={`portal-shell__content ${contentClassName}`.trim()}>
          {children}
        </main>
      </div>
    </div>
  );
}
