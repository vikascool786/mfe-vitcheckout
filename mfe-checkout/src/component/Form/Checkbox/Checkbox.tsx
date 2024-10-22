import React from "react";
import "./Checkbox.scss";

interface ICheckboxProps {
  title: string;
  subtitle?: string;
}

export const Checkbox: React.FC<ICheckboxProps> = ({ title, subtitle }) => {
  return (
    <div className="checkbox-container">
      <input type="checkbox" />
      <div className="checkbox-sub-container">
        <div className="checkbox-text">{title}</div>
        {subtitle && <div className="checkbox-sub-text">{subtitle}</div>}
      </div>
    </div>
  );
};
