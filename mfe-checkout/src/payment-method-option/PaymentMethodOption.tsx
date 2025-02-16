import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { debounce } from "lodash";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { buildOrder } from "../api/service/Order";
import {
  updateShopperDetails,
  updateTempPaymentMethod,
} from "../api/service/ShoppersPaymentMethods";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import {
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentTypeIdList,
} from "../payment-method/PaymentType";
import {
  IPaymentOption,
  cvvValidAtom,
  loadingAtom,
  orderAtom,
  paymentMethodsAtom,
} from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./PaymentMethodOption.scss";
import { ThirdPartyLinkOff } from "./ThirdPartyLinkOff";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import { Address } from "../interfaces/Address";
import { getCardType } from "../utils/helpers/GetCardType";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const setCvvValid = useSetAtom(cvvValidAtom);

  const {
    paymentMethod,
    paymentAddress,
    isPaymentValidated,
    isTempPaymentMethod,
    isEditing,
  } = paymentOption;

  const [cvvCode, setCvvCode] = useState<string>("");
  const [isCvvTouched, setIsCvvTouched] = useState<boolean>(false);

  const setLoading = useSetAtom(loadingAtom);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard =
    paymentMethod.accountName !== PAYPAL.name &&
    paymentMethod.accountName !== SEZZLE.name;

  const getCardNumber = (ccNumber: any) => {
    return "*" + ccNumber?.slice(-4);
  };

  const handlePaymentMethodEdit = (e) => {
    if (isSelected && paymentMethod) {
      onCardEdit(paymentMethod.id);
    }
  };

  const onChangePaymentMethod = () => {
    // Set editing to false if switching to a different payment method

    // Update payment methods with the selected method

    const updatedPaymentOptions = paymentMethods.map((method) => {
      if (method.paymentMethod.id !== paymentOption.paymentMethod.id) {
        setCvvCode("");
      }
      return method.paymentMethod.id === paymentOption.paymentMethod.id
        ? {
          ...method,
          isSelected: true,
          isVisible: true,
          isPaymentValidated: false,
        }
        : {
          ...method,
          isSelected: false,
          isEditing: false,
          isPaymentValidated: false,
        };
    });

    const selectedPayment = updatedPaymentOptions.find((pm) => pm.isSelected);

    if (order) {
      setOrder({
        ...order,
        isOrderValid:
          paymentMethod.typeID === PAYPAL.typeId ||
          paymentMethod.typeID === SEZZLE.typeId,
      });
    }
    updatePaymentTypeId(selectedPayment?.paymentMethod.typeID ?? 0);
    setCvvValid(false);
    // Set updated payment methods to state
    setPaymentMethods(updatedPaymentOptions);
  };

  const handleCVV = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove non-numeric characters immediately
    input = input.replace(/\D/g, "");

    setCvvCode(input); // Update state with only numbers

    const requiredDigits = paymentOption.paymentMethod.typeID === 1 ? 4 : 3;

    // Check if the input contains only numbers and has the correct length
    if (!/^\d*$/.test(input)) {
      setCvvValid(false);
      alert("Invalid CVV: Only numbers are allowed."); // Throw an error if non-numeric character is included
      return;
    }

    if (input.length === requiredDigits) {
      setCvvValid(true);
      debouncedOnValidCVV(input); // Debounced validation function
    } else {
      setCvvValid(false);
    }
  };


  // Debounced function to handle valid CVV
  const debouncedOnValidCVV = debounce((input: string) => {
    if (order) {
      setOrder({
        ...order,
        isOrderValid: false,
      });
    }
    if (input.length === maxLength) {
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
        preferred: true,
        cvv,
      };

      let isPaymentMethodValid;
      try {
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
      } catch (error) {
        if (order) {
          setOrder({
            ...order,
            isOrderValid: false,
          });
        }
        setErrorMessage("Invalid CVV");
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
            id: paymentAddress?.id as number,
          },
        });
        const orderResponse = await buildOrder(updatedOrder);
        setOrder({
          ...orderResponse.response.success.data,
          isOrderValid: true,
        });
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

  // cleanup function
  useEffect(() => {
    return () => debouncedOnValidCVV.cancel();
  }, []);

  const onAddCardAndUpdate = (paymentOptions: IPaymentOption[]) => {
    setCvvCode("***");
    onAddNewCards(paymentOptions);
  };

  const updatePaymentValidationStatus = (id: number) => {
    // Update payment methods with the selected method
    const updatedPaymentOptions = paymentMethods.map((method) => ({
      ...method,
      isPaymentValidated: method.paymentMethod.id === id ? true : false,
    }));

    setPaymentMethods(updatedPaymentOptions);
  };

  const maxLength = paymentMethod.typeID === 1 ? 4 : 3;

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
                <div className="payment-option-container__card-number">
                  {getCardNumber(paymentMethod.number)}
                </div>
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
                <div>
                  <input
                    onChange={handleCVV}
                    onFocus={() => setIsCvvTouched(true)}
                    className="payment-option-container__card-cvv-form"
                    value={cvvCode}
                    maxLength={maxLength}
                    type="password"
                    required
                  />
                  <div className="cvv-text">3 or 4 digits</div>
                  {isCvvTouched && cvvCode.length < maxLength && (
                    <div className="error-message">Invalid CVV</div>
                  )}
                </div>
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
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
          </div>
        ) : null}
      </div>

      {!isCard && isSelected && (
        <ThirdPartyLinkOff paymentMethod={paymentMethod} />
      )}

      {isEditing && (
        <CardInformation
          paymentMethod={paymentMethod}
          address={paymentAddress}
          isPaymentValidated={isPaymentValidated}
          updatePaymentValidationStatus={updatePaymentValidationStatus}
          shopperId={shopperId}
          onCancel={handleCancelNewCard}
          onAddNewCard={onAddCardAndUpdate}
          setCvvCode={setCvvCode}
        />
      )}
    </div>
  );
};