import type { FC } from "react";
import "./Dropdown.css";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

export const Dropdown: FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  name,
  disabled = false,
}) => {
  return (
    <div className="ui-dropdown">
      <label className="ui-dropdown__label">{label}</label>
      <select
        className="ui-dropdown__select"
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
