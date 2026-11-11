import type { ReactNode } from "react";
import "./TopNavigation.css";

export interface TopNavigationProps {
  logo?: ReactNode;
  menu?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function TopNavigation({
  logo,
  menu,
  actions,
  className = "",
}: TopNavigationProps) {
  return (
    <div className={`ui-top-navigation ${className}`.trim()}>
      <div className="ui-top-navigation__logo">{logo}</div>
      <div className="ui-top-navigation__menu">{menu}</div>
      <div className="ui-top-navigation__actions">{actions}</div>
    </div>
  );
}
