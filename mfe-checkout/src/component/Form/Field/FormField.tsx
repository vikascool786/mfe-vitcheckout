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

const sanitizeInput = (value: string) => {
  // Remove any HTML tags or scripts
  return value.replace(/<[^>]*>?/gm, "");
};

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
          type={type}
          ref={(el: HTMLInputElement | null) =>
            el && errorRefs && errorRefs.current
              ? (errorRefs.current[name!] = el)
              : null
          }
          {...props}
          name={name}
          maxLength={maxLength}
          onChange={(e) => {
            console.log("event.target.name", e.target.name); //
            const sanitizedValue = sanitizeInput(e.target.value);
        
            // Mutate the event directly to keep Formik happy
            e.target.value = sanitizedValue;
        
            // Call original handler
            props.onChange?.(e);
          }}
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
