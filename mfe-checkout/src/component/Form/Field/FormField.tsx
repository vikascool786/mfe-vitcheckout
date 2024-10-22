import React, { ReactNode } from "react";
import "./FormField.scss";
import { Checkbox } from "../Checkbox/Checkbox";

interface IFormFieldProps {
  label?: string;
  renderCheckBox?: ReactNode;
  required?: boolean;
}
export const FormField: React.FC<IFormFieldProps> = ({
  label,
  required,
  renderCheckBox,
  ...props
}) => {
  return (
    <div className="field-item-container">
      {label && <div className={required ? "required-field" : ""}>{label}</div>}
      <input className="input-container" {...props} />
      {renderCheckBox}
    </div>
  );
};
