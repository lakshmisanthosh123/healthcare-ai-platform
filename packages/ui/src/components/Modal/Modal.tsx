import type { FC, ReactNode } from "react";
import "./Modal.css";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
  className,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-modal-overlay" role="dialog" aria-modal="true">
      <div className={`ui-modal${className ? ` ${className}` : ""}`}>
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">{title}</h2>
          <button
            className="ui-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="ui-modal__content">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
};
