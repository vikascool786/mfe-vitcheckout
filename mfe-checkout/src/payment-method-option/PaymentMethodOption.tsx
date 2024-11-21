import React, { useState } from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { ShopperSavedPayments } from "../interfaces/ShopperSavedPayments";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import "./PaymentMethodOption.scss";

export interface IPaymentOptionProps {
  name: string;
  image: string;
  selected: boolean;
  index: number;
  size: number;
  isSavedCard?: boolean;
  onChange: () => void;
  shopperSavedPayment?: ShopperSavedPayments;
}
export const PaymentOption: React.FC<
  IPaymentOptionProps & {
    isEditing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
  }
> = ({
  name,
  image,
  selected,
  onChange,
  index,
  isEditing,
  onEdit,
  onCancelEdit,
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
            id={shopperSavedPayment?.id?.toString() || name}
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
                <div>*{shopperSavedPayment.cardMask}</div>
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
            {!isEditing && (
              <div
                className="payment-option-container__card-cvv-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                edit
              </div>
            )}
          </div>
        ) : null}
      </div>
      {isEditing && (
        <CardInformation
          initialData={{
            ...shopperSavedPayment,
          }}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
};
