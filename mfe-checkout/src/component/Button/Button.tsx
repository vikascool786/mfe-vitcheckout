import React, { forwardRef } from "react";
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

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
    ({ label, btnType, logo, qaTag = "", disabled, ...props }, ref) => {
      return (
          <button
              ref={ref}
              className={`${qaTag} custom-button ${btnType}`}
              type="button"
              disabled={disabled}
              {...props}
          >
            {label}
            {logo && <img src={logo} alt={label} />}
          </button>
      );
    }
);