import React from "react";
import "./PaymentMethodOption.scss";
import { RadioButton } from "../component/RadioButton/RadioButton";
import {IPaymentMethodOption} from "../payment-method/PaymentMethods";

interface ISavedCreditCard {
  paymentMethod: IPaymentMethodOption;
  index: number;
}

export const SavedCreditCard: React.FC<ISavedCreditCard> = ({
    paymentMethod,
    index
}) => {
  const isFirst = index === 0 ? "start" : "";

  return (
    <div
      className={`payment-option-container ${paymentMethod.selected} ${isFirst}`}
    >
      <div className="payment-option-select-container">
        <div className={`payment-option-sub-container`}>
          <RadioButton
            id={paymentMethod.shopperSavedPayment?.id.toString() || ""}
            checked={paymentMethod.selected}
          />
          <div className="payment-option-container__card">
            <img className="payment-option-container__card-img" src={paymentMethod.image} alt={paymentMethod.name}/>
            <div>{paymentMethod.shopperSavedPayment?.cardMask}</div>
            <div>{paymentMethod.shopperSavedPayment?.expirationDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
