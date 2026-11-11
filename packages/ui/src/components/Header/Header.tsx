import type { ReactNode } from "react";
import "./Header.css";

export interface HeaderProps {
  logo?: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Header({
  logo,
  navigation,
  actions,
  className = "",
}: HeaderProps) {
  return (
    <header className={`ui-header ${className}`.trim()}>
      <div className="ui-header__branding">{logo}</div>
      <nav className="ui-header__navigation">{navigation}</nav>
      <div className="ui-header__actions">{actions}</div>
    </header>
  );
}
