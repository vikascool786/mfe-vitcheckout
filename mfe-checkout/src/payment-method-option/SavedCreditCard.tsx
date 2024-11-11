import React from "react";
import "./PaymentMethodOption.scss";
import { RadioButton } from "../component/RadioButton/RadioButton";
import {IPaymentMethodOption} from "../payment-method/PaymentMethods";
import {FormField} from "../component/Form/Field/FormField";

interface ISavedCreditCard {
  paymentMethod: IPaymentMethodOption;
  index: number;
}

export const SavedCreditCard: React.FC<ISavedCreditCard> = ({
    paymentMethod,
    index
}) => {
  const isSelected = paymentMethod.selected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";

  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
    >
      <div className="payment-option-select-container">
        <div className={`payment-option-sub-container`}>
          <RadioButton
            id={paymentMethod.shopperSavedPayment?.id.toString() || ""}
            checked={paymentMethod.selected}
          />
          <div className="payment-option-container__saved-cards">
            <div className="payment-option-container__card">
              <img className="payment-option-container__card-img" src={paymentMethod.image} alt={paymentMethod.name}/>
              <div className="payment-option-container__card-text">{paymentMethod.shopperSavedPayment?.cardMask}</div>
              <div className="payment-option-container__card-text">{paymentMethod.shopperSavedPayment?.expirationDate}</div>
            </div>
            <div className="payment-option-container__cvv">
              <FormField label="CVV" name={"cvv"}/>
            </div>
            <div>
              Edit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
