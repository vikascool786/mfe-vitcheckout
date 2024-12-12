import React from "react";
import './Button.scss';

interface IButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    type: 'primary' | 'secondary';
    label: string;

}

export const Button: React.FC<IButtonProps> = ({ label, type, ...props }) => {
  return (
    <button className={`custom-button ${type}`} {...props} type="button">
      {label}
    </button>
  );
};