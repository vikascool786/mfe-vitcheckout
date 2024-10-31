import React, { ReactNode } from "react";
import "./FormField.scss";
import { Checkbox } from "../Checkbox/Checkbox";

interface IFormFieldProps {
  label?: string;
  renderCheckBox?: ReactNode;
  required?: boolean;
  extraLabel?: string;
  name?: string;
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
      <input className="input-container" {...props} name={name} />
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};
