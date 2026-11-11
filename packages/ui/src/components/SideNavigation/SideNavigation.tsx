import type { ReactNode } from "react";
import "./SideNavigation.css";

export interface SideNavigationProps {
  header?: ReactNode;
  menu?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SideNavigation({
  header,
  menu,
  footer,
  className = "",
}: SideNavigationProps) {
  return (
    <aside className={`ui-side-navigation ${className}`.trim()}>
      {header && <div className="ui-side-navigation__header">{header}</div>}
      <div className="ui-side-navigation__menu">{menu}</div>
      {footer && <div className="ui-side-navigation__footer">{footer}</div>}
    </aside>
  );
}
