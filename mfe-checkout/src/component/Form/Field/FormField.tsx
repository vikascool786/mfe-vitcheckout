import React, { ReactNode, useState } from "react";
import "./FormField.scss";
import { Checkbox } from "../Checkbox/Checkbox";

interface IFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  renderCheckBox?: ReactNode;
  required?: boolean;
  extraLabel?: string;
}

export const FormField: React.FC<IFormFieldProps> = ({
  label,
  required,
  extraLabel,
  renderCheckBox,
  name,
  ...props
}) => {
  return (
    <div className="field-item-container">
      {label && <div className={required ? "required-field" : ""}>{label}</div>}
      <input className="input-container" name={name} {...props} />
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};
