import React from "react";
import "./Checkbox.scss";

// Extend the interface to accept standard input props
interface ICheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  subtitle?: string;
}

export const Checkbox: React.FC<ICheckboxProps> = ({ title, subtitle, ...inputProps }) => {
  return (
    <div className="checkbox-container">
      <input type="checkbox" {...inputProps} /> {/* Spread the input props here */}
      <div className="checkbox-sub-container">
        <div className="checkbox-text">{title}</div>
        {subtitle && <div className="checkbox-sub-text">{subtitle}</div>}
      </div>
    </div>
  );
};