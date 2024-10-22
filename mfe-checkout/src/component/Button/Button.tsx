import React from "react";
import './Button.scss';

interface IButtonProps {
    type: 'primary' | 'secondary';
    label: string;
}

export const Button: React.FC<IButtonProps> = ({ label, type }) => {
  return (
    <button className={`custom-button ${type}`}>
      {label}
    </button>
  );
};