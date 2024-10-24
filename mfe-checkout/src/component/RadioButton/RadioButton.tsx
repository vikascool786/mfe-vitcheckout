import React from "react";
import { InputHTMLAttributes } from "react";
import "./RadioButton.scss";

export interface InputElementProps
  extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

export interface IOption {
  label: string;
  name?: string;
  disabled?: boolean;
}

export interface IOptionGroup {
  label: string;
  options: IOption[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButton: React.FC<InputElementProps> = ({ id, ...props }) => {
  return (
    <div className="radio-wrapper">
      <input className="radio-style" type="radio" id={id} d {...props} />
    </div>
  );
};

const RadioButtonGroup = ({ label, options }: IOptionGroup) => {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div>[...RADIO BUTTONS HERE...]</div>
    </fieldset>
  );
};
