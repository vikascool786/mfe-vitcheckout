import { useAtom, useSetAtom } from "jotai";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import { debounce } from "lodash";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import {
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentTypeIdList,
} from "../payment-method/PaymentType";
import {
  IPaymentOption,
  loadingAtom,
  orderAtom,
  paymentMethodsAtom,
} from "../store";
import "./PaymentMethodOption.scss";
import { buildOrder, changeOrder } from "../api/service/Order";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { IPaymentMethod } from "../interfaces/PaymentMethod";
import {
  updateShopperDetails,
  updateTempPaymentMethod,
} from "../api/service/ShoppersPaymentMethods";
import {ThirdPartyLinkOff} from "./ThirdPartyLinkOff";

export interface IPaymentOptionProps {
  handleCancelNewCard: () => void;
  paymentOption: IPaymentOption;
  onAddNewCards: (paymentOptions: IPaymentOption[]) => void;
  shopperId: string;
  onCardEdit: (id: number) => void;
  index: number;
  updatePaymentTypeId: (newValue: number) => void;
}

export const PaymentOption: React.FC<IPaymentOptionProps> = ({
  index,
  shopperId,
  onCardEdit,
  paymentOption,
  onAddNewCards,
  handleCancelNewCard,
  updatePaymentTypeId,
}) => {
  const [order, setOrder] = useAtom(orderAtom);

  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  const {
    paymentMethod,
    paymentAddress,
    isPaymentValidated,
    isTempPaymentMethod,
    isEditing,
  } = paymentOption;

  const [cvvCode, setCvvCode] = useState<string>(
    isPaymentValidated ? "***" : ""
  );

  const setLoading = useSetAtom(loadingAtom);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard =
    paymentMethod.accountName !== PAYPAL.name &&
    paymentMethod.accountName !== SEZZLE.name;

  const handlePaymentMethodEdit = () => {
    if (isSelected && paymentMethod) {
      onCardEdit(paymentMethod.id);
    }
  };

  const onChangePaymentMethod = () => {
    // Check if the selected payment option is the same as the current one
    if (order?.paymentMethod?.id === paymentOption.paymentMethod.id) {
      return;
    }

    // Set editing to false if switching to a different payment method

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
          isEditing: false,
        }
    );

    const selectedPayment = updatedPaymentOptions.find((pm) => pm.isSelected);
    updatePaymentTypeId(selectedPayment?.paymentMethod.typeID ?? 0);

    // Set updated payment methods to state
    setPaymentMethods(updatedPaymentOptions);
  };

  const handleCVV = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only numbers and limit the length to 4
    if (/^\d{0,4}$/.test(input)) {
      setCvvCode(input);

      // Debounced function to validate CVV
      debouncedOnValidCVV(input);
    }
  };

  // Debounced function to handle valid CVV
  const debouncedOnValidCVV = debounce((input: string) => {
    if (input.length === 3 || input.length === 4) {
      onValidCVV(input);
    }
  }, 300); // Adjust debounce time as needed

  const onValidCVV = async (cvv: string) => {
    setLoading(true);
    if (
      !thirdPartyPaymentTypeIdList().includes(
        paymentOption.paymentMethod.typeID
      ) &&
      order
    ) {
      const requestData = {
        ...paymentMethod,
        cvv,
      };

      let isPaymentMethodValid;
      if (isTempPaymentMethod) {
        isPaymentMethodValid = await updateTempPaymentMethod(
          shopperId,
          requestData
        );
      } else {
        isPaymentMethodValid = await updateShopperDetails(
          shopperId,
          paymentMethod.id,
          requestData
        );
      }
      if (order && isPaymentMethodValid && !isPaymentValidated) {
        const updatedOrder = generateChangeStoreResponse({
          ...order,
          paymentMethod: {
            ...order.paymentMethod,
            id: paymentMethod.id,
          },
          billingAddress: {
            ...paymentAddress,
            id: paymentAddress.id as number,
          },
        });
        const orderResponse = await buildOrder(updatedOrder);
        setOrder(orderResponse.response.success.data);
        setLoading(false);

        // Update payment methods with the selected method
        const updatedPaymentOptions = paymentMethods.map((method) =>
          method.paymentMethod.id === paymentOption.paymentMethod.id
            ? {
              ...method,
              isSelected: true,
              isVisible: true,
              isPaymentValidated: true,
            }
            : {
              ...method,
              isSelected: false,
            }
        );

        setPaymentMethods(updatedPaymentOptions);
      }

      setLoading(false);
    }
  };

  const updatePaymentValidationStatus = (id: number) => {
    // Update payment methods with the selected method
    const updatedPaymentOptions = paymentMethods.map((method) => ({
      ...method,
      isPaymentValidated: method.paymentMethod.id === id ? true : false,
    }));

    setCvvCode((prev) => "***");

    // Set updated payment methods to state
    setPaymentMethods(updatedPaymentOptions);
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
                  onChange={handleCVV}
                  className="payment-option-container__card-cvv-form"
                  value={cvvCode}
                  type="password"
                  placeholder="3 or 4 digits"
                />
              </div>
            )}
            {isSelected && isCard && (
              <div
                className="payment-option-container__card-cvv-edit"
                onClick={handlePaymentMethodEdit}
              >
                edit
              </div>
            )}
          </div>
        ) : null}
      </div>

      {!isCard && isSelected && (
          <ThirdPartyLinkOff paymentMethod={paymentMethod}/>
      )}

      {isEditing && (
        <CardInformation
          paymentMethod={paymentMethod}
          address={paymentAddress}
          isPaymentValidated={isPaymentValidated}
          updatePaymentValidationStatus={updatePaymentValidationStatus}
          shopperId={shopperId}
          onCancel={handleCancelNewCard}
          onAddNewCard={onAddNewCards}
        />
      )}
    </div>
  );
};
