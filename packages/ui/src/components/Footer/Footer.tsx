import type { ReactNode } from "react";
import "./Footer.css";

export interface FooterProps {
  copyright?: ReactNode;
  links?: ReactNode;
  className?: string;
}

export function Footer({ copyright, links, className = "" }: FooterProps) {
  return (
    <footer className={`ui-footer ${className}`.trim()}>
      <div className="ui-footer__copyright">{copyright}</div>
      <div className="ui-footer__links">{links}</div>
    </footer>
  );
}
