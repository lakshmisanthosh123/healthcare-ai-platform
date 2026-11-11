import type { FC } from "react";
import "./Input.css";

export interface InputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  name?: string;
  autoComplete?: string;
}

export const Input: FC<InputProps> = ({
  id,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  name,
  autoComplete,
}) => {
  return (
    <input
      id={id}
      name={name}
      value={value}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      className="ui-input"
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
