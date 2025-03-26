import React from "react";
import "./Button.scss";

interface IButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
    btnType: "primary" | "secondary" | "disabled" | "paypal" | "sezzle";
  label: string;
  logo?: string;
  qaTag?: string;
  disabled?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  label,
  btnType,
  logo,
  qaTag = "",
  disabled,
  ...props
}) => {
  return (
    <button className={`${qaTag} custom-button ${btnType}`} type="button" {...props} disabled={disabled}>
      {label}
      {logo && <img src={logo} alt={label} />}
    </button>
  );
};
