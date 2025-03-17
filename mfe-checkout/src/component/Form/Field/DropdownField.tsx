import React from "react";
import { DropdownOption } from "../../../interfaces/DropdownOption";
import "./DropdownField.scss";

type DropdownProps = {
  options: DropdownOption[]; // Array of options to populate the dropdown
  label?: string; // Optional label for the dropdown
  required?: boolean; // Whether the field is required
  selectedValue?: string; // Default selected value
  formName?: string; // Form name for the dropdown
  onChange?: (value: string) => void; // Callback for handling selection changes
  errorMessage?: string | false | undefined;
  className?: string;
  errorRefs?: React.MutableRefObject<{
    [key: string]: HTMLInputElement | HTMLSelectElement | null;
  }> | null;
  disabled?: boolean;
  qaTag?: string;
};

export const DropdownField: React.FC<DropdownProps> = ({
  options,
  label,
  required = false,
  selectedValue,
  formName,
  onChange,
  errorMessage,
  className,
  qaTag = "",
  errorRefs = null,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (onChange) {
      onChange(value); // Pass the selected value to the parent
    }
  };
  return (
    <div className={`${className || ""} field-item-container`}>
      {label && (
        <label htmlFor={formName} className={required ? "required-field" : ""}>
          {label}
        </label>
      )}
      <select
        className="input-container"
        name={formName}
        ref={(el: HTMLSelectElement | null) =>
          el && errorRefs && errorRefs.current
            ? (errorRefs.current[formName!] = el)
            : null
        }
        value={selectedValue} // Controlled component behavior
        onChange={handleChange} // Handle change events
        required={required}
        disabled={disabled}
      >
        <option value="" disabled>
          {`Select ${label || "an option"}`}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};
