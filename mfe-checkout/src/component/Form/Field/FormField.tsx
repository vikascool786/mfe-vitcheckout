import React, {ReactNode, useState} from "react";
import "./FormField.scss";
import { Checkbox } from "../Checkbox/Checkbox";

interface IFormFieldProps {
  label?: string;
  renderCheckBox?: ReactNode;
  required?: boolean;
  extraLabel?: string;
  name?: string;
  value?: string;
}
export const FormField: React.FC<IFormFieldProps> = ({
  label,
  required,
  extraLabel,
  renderCheckBox,
  name,
  value,
  ...props
}) => {
  const [inputValue, setValue] = useState(value);
  return (
    <div className="field-item-container">
      {label && <div className={required ? "required-field" : ""}>{label}</div>}
      <input className="input-container" {...props} name={name} value={inputValue} onChange={(e) => setValue(e.target.value)}/>
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};
