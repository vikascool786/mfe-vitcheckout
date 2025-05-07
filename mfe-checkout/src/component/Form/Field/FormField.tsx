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
  className,
  type,
  ...props
}) => {

  const shouldAddInputContainer =
    type !== "checkbox" && !className?.includes("input-container");
  const baseClasses = [
    qaTag,
    shouldAddInputContainer ? "input-container" : "",
    errorMessage ? "error-border" : "",
    props.disablePasswordManager ? "disable-password-manager" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="field-item-container">
      {label && (
        <label htmlFor={formName} className={required ? "required-field" : ""}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          className={baseClasses}
          name={name}
          type={type}
          ref={(el: HTMLInputElement | null) =>
            el && errorRefs && errorRefs.current
              ? (errorRefs.current[name!] = el)
              : null
          }
          {...props}
          maxLength={maxLength}
        />
        {errorMessage && (
          <span className="material-symbols-outlined error-icon">error</span>
        )}
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {extraLabel && <div className="field-extra-label">{extraLabel}</div>}
      {renderCheckBox}
    </div>
  );
};
