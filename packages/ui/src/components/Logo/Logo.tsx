import type { ReactNode } from "react";
import "./Logo.css";

export interface LogoProps {
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
}

export function Logo({
  src,
  alt = "Logo",
  children,
  className = "",
}: LogoProps) {
  return (
    <div className={`ui-logo ${className}`.trim()}>
      {src ? <img src={src} alt={alt} className="ui-logo__image" /> : null}
      {children && <span className="ui-logo__text">{children}</span>}
    </div>
  );
}
