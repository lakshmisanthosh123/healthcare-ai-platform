import type { FC } from "react";
import "./TextField.css";

export interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
}

export const TextField: FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  error,
  disabled = false,
  rows = 4,
}) => {
  return (
    <div className="ui-textfield">
      <label className="ui-textfield__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className={`ui-textfield__input ${error ? "ui-textfield__input--error" : ""}`.trim()}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="ui-textfield__error">{error}</span> : null}
    </div>
  );
};
