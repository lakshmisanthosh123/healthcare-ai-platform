import type { ReactNode } from "react";
import "./PageHeader.css";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  meta,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`ui-page-header ${className}`.trim()}>
      <div>
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
      {meta && <div className="ui-page-header__meta">{meta}</div>}
    </div>
  );
}
