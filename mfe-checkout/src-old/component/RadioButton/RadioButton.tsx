import React, { InputHTMLAttributes } from "react";
import "./RadioButton.scss";

export interface InputElementProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

export const RadioButton: React.FC<InputElementProps> = ({ id, ...props }) => {
  return (
    <div className="radio-wrapper">
      <input className="radio-style" type="radio" id={id} {...props} />
      <label htmlFor={id}>{props.title}</label>
    </div>
  );
};