import React from "react";
import { DropdownOption } from "../../../interfaces/DropdownOption";
import "./DropdownField.scss";
import { useContentStrings } from "../../../hooks/useContentStrings";

interface DropdownProps
  extends Omit<React.InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: DropdownOption[]; // Array of options to populate the dropdown
  label?: string; // Optional label for the dropdown
  placeholder?: string; // Optional placeholder for the dropdown
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
}

export const DropdownField: React.FC<DropdownProps> = ({
  options,
  label,
  placeholder = "",
  required = false,
  selectedValue,
  formName,
  onChange,
  errorMessage,
  className,
  qaTag = "",
  errorRefs = null,
  disabled = false,
  ...props
}) => {
  const { getString } = useContentStrings();
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
      <div className="select-wrapper">
        <select
          className={`input-container ${qaTag} ${
            errorMessage ? "error-border" : ""
          }`}
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
          {...props}
        >
          <option value="" disabled>
            {placeholder ? placeholder : `${getString("select")} ${label || getString("anOption")}`}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <span className="material-symbols-outlined error-icon">error</span>
        )}
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};
