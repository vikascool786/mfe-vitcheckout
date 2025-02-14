import React from "react";
import "./Button.scss";

interface IButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  btnType: "primary" | "secondary" | "disabled";
  label: string;
  logo?: string;
}

export const Button: React.FC<IButtonProps> = ({
  label,
  btnType,
  logo,
  ...props
}) => {
  return (
    <button className={`custom-button ${btnType}`} type="button" {...props}>
      {label}
      {logo && (<img src={logo} alt={label} />)}
    </button>
  );
};
