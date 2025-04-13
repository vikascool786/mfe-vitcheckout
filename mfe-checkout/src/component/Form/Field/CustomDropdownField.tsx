import React, { useState, useRef, useEffect } from "react";
import { DropdownOption } from "../../../interfaces/DropdownOption";
import "./CustomDropdownField.scss";
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
  errorRefs?: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null;
  }> | null;
  disabled?: boolean;
  qaTag?: string;
};

export const CustomDropdownField: React.FC<DropdownProps> = ({
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

  const handleSelect = (
    value: string,
    event: React.MouseEvent<HTMLLIElement>
  ) => {
    event.stopPropagation();
    setSelected(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`${qaTag} ${className || ""} field-item-container`}
      ref={dropdownRef}
    >
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
          {selected
            ? options.find((opt) => opt.value === selected)?.label
            : `Select ${label || "an option"}`}
          <Back
            className={`mfe-accordion ${isOpen ? "open" : "close"}`}
            width="13"
            height="14"
            viewBox="0 0 24 14"
            style={{ width: "4px", height: "7px" }}
          />
        </div>

        {isOpen && (
          <ul className="dropdown-options">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={(e) => handleSelect(option.value, e)}
                className="dropdown-option"
              >
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
