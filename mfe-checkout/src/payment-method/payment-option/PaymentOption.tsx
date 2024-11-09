// PaymentOption.tsx
import React from "react";
import "./PaymentMethodOption.scss";
import { RadioButton } from "../../component/RadioButton/RadioButton";
import { CardInformation } from "../card-information/CardInformation";

export interface IPaymentOptionProps {
  name: string;
  image: string;
  selected: boolean;
  index: number;
  size: number;
  isSavedCard?: boolean;
  onChange: () => void;
  shopperSavedPayment?: {
    id: string;
    cardMask: string;
    expirationDate: string;
  };
}

export const PaymentOption: React.FC<IPaymentOptionProps> = ({
  name,
  image,
  selected,
  onChange,
  index,
  size,
  isSavedCard = false,
  shopperSavedPayment,
}) => {
  const isSelected = selected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const showCardImage = isSavedCard && shopperSavedPayment;
  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
      onClick={onChange}
    >
      <div className="payment-option-select-container">
        <div className="payment-option-sub-container">
          <RadioButton
            id={shopperSavedPayment?.id || name}
            onChange={onChange}
            checked={selected}
          />
          {!showCardImage && <div className="payment-option-name">{name}</div>}
          {!showCardImage && <img src={image} />}
        </div>
      </div>

      {showCardImage ? (
        <div className="payment-option-container__card">
          <div className="payment-option-container__card-details">
            <img
              className="payment-option-container__card-img"
              src={image}
              alt={name}
            />
            <div>{shopperSavedPayment.cardMask}</div>
          </div>
          <div>Expires {shopperSavedPayment.expirationDate}</div>
        </div>
      ) : index === 0 ? (
        <CardInformation />
      ) : null}
    </div>
  );
};
