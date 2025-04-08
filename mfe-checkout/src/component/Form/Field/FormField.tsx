import React, { ReactNode } from "react";
import "./FormField.scss";

interface IFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  renderCheckBox?: ReactNode;
  required?: boolean;
  extraLabel?: string;
  errorMessage?: string | false | undefined;
  errorRefs?: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null;
  }> | null;
  maxLength?: number;
  qaTag?: string;
  disablePasswordManager?: boolean;
  formName?: string;
}

export const FormField: React.FC<IFormFieldProps> = ({
  label,
  required,
  extraLabel,
  errorMessage,
  renderCheckBox,
  name,
  errorRefs = null,
  maxLength,
  qaTag = "",
  formName,
  ...props
}) => {
  return (
    <div className="field-item-container">
      {label && (
        <label htmlFor={formName} className={required ? "required-field" : ""}>
          {label}
        </label>
      )}
      <input
        className={`${qaTag} input-container ${
          errorMessage ? "error-border" : ""
          } ${props.disablePasswordManager ? "disable-password-manager" : ""}`}
        name={name}
        ref={(el: HTMLInputElement | null) =>
          el && errorRefs && errorRefs.current
            ? (errorRefs.current[name!] = el)
            : null
        }
        {...props}
        maxLength={maxLength}
      />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};
