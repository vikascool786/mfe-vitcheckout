import { useAtom } from "jotai";
import React, { useState } from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import {PAYPAL, SEZZLE, thirdPartyPaymentTypeIdList} from "../payment-method/PaymentType";
import { IPaymentOption, orderAtom, paymentMethodsAtom } from "../store";
import "./PaymentMethodOption.scss";
import { changeOrder } from "../api/service/Order";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";

export interface IPaymentOptionProps {
  paymentOption: IPaymentOption;
  shopperId: string;
  index: number;
  removeCard: () => void;
}

export const PaymentOption: React.FC<IPaymentOptionProps> = ({
  index,
  shopperId,
  paymentOption,
}) => {
  const [order] = useAtom(orderAtom);
  const { paymentMethod, paymentAddress } = paymentOption;
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  const [isEditing, setIsEditing] = useState<boolean>(paymentMethod.id === 0);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard =
    paymentMethod.accountName !== PAYPAL.name &&
    paymentMethod.accountName !== SEZZLE.name;

  const onChangePaymentMethod = () => {
    const paypalOrSezzle = paymentMethods.find(
      (method) =>
        method.paymentMethod.accountName.includes("PayPal") ||
        method.paymentMethod.accountName.includes("Sezzle")
    );
    // Update payment methods with the selected method
    const updatedPaymentOptions = paymentMethods.map((method) =>
      method.paymentMethod.id === paymentOption.paymentMethod.id
        ? {
          ...method,
          isSelected: true,
          isVisible: true,
        }
        : {
          ...method,
          isSelected: false,
        }
    );

    // Set updated payment methods to state
    setPaymentMethods(updatedPaymentOptions);

    // Trigger side effect to update order with the new payment method
    if(!thirdPartyPaymentTypeIdList().includes(paymentOption.paymentMethod.typeID)){
      changeOrder(
        generateChangeStoreResponse({
          ...order,
          paymentMethod: {
            ...paymentOption.paymentMethod,
            id: paymentOption.paymentMethod.id,
          },
        }),
        order?.id
      );
    }
  };

  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
      onClick={onChangePaymentMethod}
    >
      <div className="payment-option-select-container">
        <div className="payment-option-sub-container">
          <RadioButton
            id={paymentMethod.accountName}
            onChange={onChangePaymentMethod}
            checked={paymentOption.isSelected}
          />
          {!isCard && (
            <div className="payment-option-name">
              {paymentMethod.accountName}
            </div>
          )}
          {!isEditing && isCard && (
            <div className="payment-option-container__card">
              <div className="payment-option-container__card-details">
                <img
                  className="payment-option-container__card-img"
                  src={paymentMethod.imageUrl}
                  alt={paymentMethod.accountName}
                />
                <div>{paymentMethod.number}</div>
              </div>
              <div className="payment-option-container__card-expiration">
                Expires {paymentMethod.expires}
              </div>
            </div>
          )}
        </div>

        {!isCard && (
          <img src={paymentMethod.imageUrl} alt={paymentMethod.accountName} />
        )}
        {!isEditing && isCard ? (
          <div className="payment-option-container__card-cvv-container">
            {isSelected && (
              <div className="payment-option-container__card-cvv">
                <div>CVV</div>
                <input
                  onClick={() => setIsEditing(!isEditing)}
                  className="payment-option-container__card-cvv-form"
                  value={order?.paymentMethod?.id ? "***" : ""}
                />
              </div>
            )}
            {isSelected && isCard && (
              <div
                className="payment-option-container__card-cvv-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
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
          paymentMethod={paymentMethod}
          address={paymentAddress}
          shopperId={shopperId}
          onCancel={() => {
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};
