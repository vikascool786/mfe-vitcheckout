import React from "react";
import { IPaymentMethodOption } from "../payment-method/PaymentMethods";
import "./PaymentMethodOption.scss";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { CardInformation } from "../payment-method/card-information/CardInformation";

interface IPaymentMethodOptionProps {
  paymentMethod: IPaymentMethodOption;
  index: number;
  size: number;
  onChange: () => void; // Add onChange to handle selection
}

export const PaymentMethodOption: React.FC<IPaymentMethodOptionProps> = ({
  paymentMethod,
  onChange,
  index,
  size,
}) => {
  const isSelected = paymentMethod.selected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";

  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
      onClick={onChange}
    >
      <div className="payment-option-select-container">
        <div className={`payment-option-sub-container`}>
          <RadioButton
            id={paymentMethod.name}
            onChange={onChange}
            checked={paymentMethod.selected}
          />
          <div className="payment-option-name">{paymentMethod.name}</div>
        </div>
        <img src={paymentMethod.image} alt={paymentMethod.name} />
      </div>
      {index === 0 && <CardInformation />}
    </div>
  );
};
