import type { FC, ReactNode } from "react";
import "./Card.css";

export interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Card: FC<CardProps> = ({
  title,
  description,
  children,
  footer,
  className = "",
}) => {
  return (
    <div className={["ui-card", className].join(" ").trim()}>
      {(title || description) && (
        <div className="ui-card__header">
          {title ? <h3 className="ui-card__title">{title}</h3> : null}
          {description ? (
            <p className="ui-card__description">{description}</p>
          ) : null}
        </div>
      )}
      <div className="ui-card__body">{children}</div>
      {footer ? <div className="ui-card__footer">{footer}</div> : null}
    </div>
  );
};
