import React from "react";
import "./Checkbox.scss";

// Extend the interface to accept standard input props
interface ICheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  subtitle?: string;
  errorMessage?: string | false | undefined;
  qaTag?: string;
}

export const Checkbox: React.FC<ICheckboxProps> = ({
  title,
  subtitle,
  errorMessage,
  qaTag = "",
  ...inputProps
}) => {
  return (
    <div className="checkbox-container">
      <input className={`${qaTag}`} type="checkbox" {...inputProps} /> {/* Spread the input props here */}
      <div className="checkbox-sub-container">
        <div className="checkbox-text">{title}</div>
        {subtitle && <div className="checkbox-sub-text">{subtitle}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </div>
  );
};
