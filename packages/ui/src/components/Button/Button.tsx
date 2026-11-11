import type { FC } from "react";
import "./Button.css";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  label,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  fullWidth = false,
}) => {
  const className = [
    "ui-button",
    `ui-button--${variant}`,
    fullWidth ? "ui-button--full" : "",
  ]
    .join(" ")
    .trim();

  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
