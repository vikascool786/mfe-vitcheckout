import React, { ReactNode } from "react";
import "./FormField.scss";

interface IFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  renderCheckBox?: ReactNode;
  required?: boolean;
  extraLabel?: string;
  errorMessage?: string | false | undefined;
}

export const FormField: React.FC<IFormFieldProps> = ({
  label,
  required,
  extraLabel,
  errorMessage,
  renderCheckBox,
  name,
  ...props
}) => {
  return (
    <div className="field-item-container">
      {label && <div className={required ? "required-field" : ""}>{label}</div>}
      <input
        className={`input-container ${errorMessage ? "error-border" : ""}`}
        name={name}
        {...props}
      />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};