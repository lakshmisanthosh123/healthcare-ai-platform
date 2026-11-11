import "./Breadcrumb.css";
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      className={`ui-breadcrumb ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <ol className="ui-breadcrumb__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="ui-breadcrumb__item">
            {item.href ? (
              <a href={item.href} className="ui-breadcrumb__link">
                {item.label}
              </a>
            ) : (
              <span className="ui-breadcrumb__current">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="ui-breadcrumb__separator">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
