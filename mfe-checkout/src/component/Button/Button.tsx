import React from "react";
import "./Button.scss";

interface IButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  btnType: "primary" | "secondary";
  label: string;
}

export const Button: React.FC<IButtonProps> = ({
  label,
  btnType,
  ...props
}) => {
  return (
    <button className={`custom-button ${btnType}`} type="button" {...props}>
      {label}
    </button>
  );
};
