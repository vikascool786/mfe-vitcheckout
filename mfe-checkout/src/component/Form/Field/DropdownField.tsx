import React from "react";
import { DropdownOption } from "../../../interfaces/DropdownOption";

type DropdownProps = {
  options: DropdownOption[]; // Array of options to populate the dropdown
  label?: string; // Optional label for the dropdown
  required?: boolean; // Whether the field is required
  selectedValue?: string; // Default selected value
  formName?: string; // Form name for the dropdown
  onChange?: (value: string) => void; // Callback for handling selection changes
  errorMessage: string | false | undefined;
};

export const DropdownField: React.FC<DropdownProps> = ({
  options,
  label,
  required = false,
  selectedValue,
  formName,
  onChange,
  errorMessage,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (onChange) {
      onChange(value); // Pass the selected value to the parent
    }
  };
  return (
    <div className="field-item-container">
      {label && (
        <label htmlFor={formName} className={required ? "required-field" : ""}>
          {label}
        </label>
      )}
      <select
        className="input-container"
        name={formName}
        value={selectedValue} // Controlled component behavior
        onChange={handleChange} // Handle change events
        required={required}
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
