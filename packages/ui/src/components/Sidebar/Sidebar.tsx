import type { ReactNode } from "react";
import "./Sidebar.css";

export interface SidebarProps {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Sidebar({
  header,
  footer,
  children,
  className = "",
}: SidebarProps) {
  return (
    <aside className={`ui-sidebar ${className}`.trim()}>
      {header && <div className="ui-sidebar__header">{header}</div>}
      <div className="ui-sidebar__content">{children}</div>
      {footer && <div className="ui-sidebar__footer">{footer}</div>}
    </aside>
  );
}
