import React, { useState, useRef, useEffect } from "react";
import { DropdownOption } from "../../../interfaces/DropdownOption";
import "./DropdownField.scss";
import { Back } from "../../../assets/svgs/Back";

type DropdownProps = {
  options: DropdownOption[];
  label?: string;
  required?: boolean;
  selectedValue?: string;
  formName?: string;
  onChange?: (value: string) => void;
  errorMessage?: string | false | undefined;
  className?: string;
  errorRefs?: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }> | null;
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
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(selectedValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${className || ""} field-item-container`} ref={dropdownRef}>
      {label && (
        <label htmlFor={formName} className={required ? "required-field" : ""}>
          {label}
        </label>
      )}

      <div
        className={`dropdown-container ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className="dropdown-selected">
          {selected ? options.find((opt) => opt.value === selected)?.label : `Select ${label || "an option"}`}
          <Back
                  className={`accordion ${isOpen ? "open" : "close"}`}
                />
        </div>

        {isOpen && (
          <ul className="dropdown-options">
            {options.map((option) => (
              <li key={option.value} onClick={() => handleSelect(option.value)} className="dropdown-option">
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};
