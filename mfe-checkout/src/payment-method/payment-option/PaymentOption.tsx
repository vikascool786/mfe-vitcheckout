import React, { useState } from "react";
import "./PaymentMethodOption.scss";
import { RadioButton } from "../../component/RadioButton/RadioButton";
import { CardInformation } from "../card-information/CardInformation";
import { FormField } from "../../component/Form/Field/FormField";

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
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

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
          {showCardImage && !isEditing && (
            <div className="payment-option-container__card">
              <div className="payment-option-container__card-details">
                <img
                  className="payment-option-container__card-img"
                  src={image}
                  alt={name}
                />
                <div>*{shopperSavedPayment.cardMask.slice(-4)}</div>
              </div>
              <div className="payment-option-container__card-expiration">
                Expires {shopperSavedPayment.expirationDate}
              </div>
            </div>
          )}
        </div>

        {!showCardImage && <img src={image} alt={name} />}
        {showCardImage ? (
          <div className="payment-option-container__card-cvv-container">
            {isSelected && !isEditing && (
              <div className="payment-option-container__card-cvv">
                <div>CVV</div>
                <input className="payment-option-container__card-cvv-form" />
              </div>
            )}
            {isEditing ? (
              <CardInformation
                initialData={{
                  cardMask: shopperSavedPayment?.cardMask,
                  expirationDate: shopperSavedPayment?.expirationDate,
                }}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div
                className="payment-option-container__card-cvv-edit"
                onClick={handleEditClick}
              >
                edit
              </div>
            )}
          </div>
        ) : index === 0 && selected ? (
          <CardInformation />
        ) : null}
      </div>
    </div>
  );
};