import { ErrorMessage } from "formik";
import { useAtom, useSetAtom } from "jotai";
import React, { ChangeEvent, useEffect, useState } from "react";
import { buildOrder } from "../api/service/Order";
import {
  updateShopperDetails,
  updateTempPaymentMethod,
} from "../api/service/ShoppersPaymentMethods";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import {
  isThirdPartyPayment,
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentTypeIdList,
} from "../payment-method/PaymentType";
import {
  IPaymentOption,
  loadingAtom,
  orderAtom,
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./PaymentMethodOption.scss";
import { ThirdPartyLinkOff } from "./ThirdPartyLinkOff";
import CardOptions from "../assets/images/CardOptions.png";
import { getVisibleCardOptionsImages } from "../utils/helpers/GetVisibleCardImages";

export interface IPaymentOptionProps {
  handleCancelNewCard: () => void;
  paymentOption: IPaymentOption;
  onAddNewCards: (paymentOptions: IPaymentOption[]) => void;
  shopperId: string;
  onCardEdit: (id: number) => void;
  index: number;
  onCollapse: (id: number) => void;
  formik: any;
  setCVVFieldValue: any;
  updatePaymentTypeId: (newValue: number) => void;
  updateCvvError: (error: string) => void;
}

export const PaymentOption: React.FC<IPaymentOptionProps> = ({
  index,
  shopperId,
  onCardEdit,
  onCollapse,
  formik,
  paymentOption,
  onAddNewCards,
  handleCancelNewCard,
  setCVVFieldValue,
  updateCvvError,
}) => {
  const [isCardEdit, setIsCardEdit] = useState<boolean>(false);
  const [order, setOrder] = useAtom(orderAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethods] = useAtom(paymentMethodsAtom);
  const setOrderNotifications = useSetAtom(orderNotificationsAtom);
  const {
    paymentMethod,
    paymentAddress,
    isPaymentValidated,
    isTempPaymentMethod,
    isEditing,
  } = paymentOption;

  useEffect(() => {
    if (order?.shouldShowInvalidCVVMessage) {
      updateCvvError("CVV is required");
    } else {
      updateCvvError("");
    }
  }, [order?.shouldShowInvalidCVVMessage]);

  const maxLength = paymentMethod.typeID === 1 ? 4 : 3;

  const setLoading = useSetAtom(loadingAtom);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard =
    paymentMethod.accountName !== PAYPAL.name &&
    paymentMethod.accountName !== SEZZLE.name;

  const getCardNumber = (ccNumber: any) => {
    return "*" + ccNumber?.slice(-4);
  };

  useEffect(() => {
    if (isCardExpired() && !isThirdPartyPayment(paymentMethod.typeID)) {
      setOrderNotifications(["The credit card has expired"]);
    }
  }, [paymentMethod]);

  const handlePaymentMethodEdit = () => {
    if (isSelected && paymentMethod) {
      onCardEdit(paymentMethod.id);
    }
  };

  const onChangePaymentMethod = () => {
    const previouslySelectedPayment = paymentMethods.find(
      (pm) => pm.isSelected
    );

    if (previouslySelectedPayment?.paymentMethod.id !== paymentMethod.id) {
      onCollapse(paymentMethod.id);
      // If you need to reset any other values manually, you can do so here.
    }
  };

  const onValidCVV = async (cvv: string) => {
    if (!order) {
      return;
    }

    setLoading(true);

    if (isCardExpired()) {
      setTimeout(() => {
        formik.setFieldValue("cvv", "", false);
        formik.setFieldError("cvv", "The credit card has expired");
      }, 300);
      setLoading(false);
      return;
    }

    const isThirdPartyPayment = thirdPartyPaymentTypeIdList().includes(
      paymentOption.paymentMethod.typeID
    );

    // Skip validation if it's a third-party payment
    if (isThirdPartyPayment) {
      setLoading(false);
      return;
    }

    const requestData = {
      ...paymentMethod,
      preferred: true,
      cvv,
    };

    try {
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

      // Prevent re-validating if already validated
      if (isPaymentValidated) {
        setLoading(false);
        return;
      }

      // Update order with validated payment method
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
        shouldShowInvalidCVVMessage: false,
      });

      // Reset all payment methods, only keep the validated one
      const updatedPaymentMethods = paymentMethods.map((method) => ({
        ...method,
        isSelected: method.paymentMethod.id === paymentOption.paymentMethod.id,
        isPaymentValidated:
          method.paymentMethod.id === paymentOption.paymentMethod.id,
      }));

      onAddNewCards(updatedPaymentMethods);

      // Reset CVV input in formik
      // formik.setFieldValue("cvv", "");
    } catch (error) {
      setOrder({ ...order, isOrderValid: false });
      // setErrorMessage("Invalid CVV");
    }

    setLoading(false);
  };

  const updatePaymentValidationStatus = (id: number) => {
    // Update payment methods with the selected method
    const updatedPaymentOptions = paymentMethods.map((method) => {
      return {
        ...method,
        paymentMethod: {
          ...paymentMethod,
          cvv: 1,
        },
        isSelected: method.paymentMethod.id === id,
        isPaymentValidated: method.paymentMethod.id === id,
      };
    });
    onAddNewCards(updatedPaymentOptions);
  };

  const isCardExpired = () => {
    const { expMonth, expYear } = paymentMethod;
    if (!expMonth || !expYear) {
      return false;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
    const currentYear = currentDate.getFullYear(); // Get last two digits of year

    return (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    );
  };

  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
      onClick={onChangePaymentMethod}
      id={`[id=${paymentMethod.id}]`}
    >
      <div
        className={`payment-option-select-container ${isEditing ? "form-mode" : ""
          }`}
      >
        <div className="payment-option-sub-container">
          <RadioButton
            id={paymentMethod.accountName}
            onChange={onChangePaymentMethod}
            checked={!!isSelected}
          />
          {!isCard && (
            <div className="payment-option-name">
              {paymentMethod.accountName}
            </div>
          )}
          {(!isEditing || isCardEdit) && isCard && (
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
          {isEditing && !isCardEdit && isCard && (
            <div className="payment-option-add-container__card">
              <div className="payment-option-add-container__card-title">
                Credit or Debit Card
              </div>
              <div>
                {order?.paymentMethods
                  ?.filter((pm) => pm.visible)
                  ?.map(
                    (pm) =>
                      pm.imageTag && (
                        <img
                          key={pm.typeID}
                          className="checkout-add-new-card "
                          src={getVisibleCardOptionsImages(pm.imageTag)}
                        />
                      )
                  )}
              </div>
            </div>
          )}
        </div>

        {!isCard && (
          <img src={paymentMethod.imageUrl} alt={paymentMethod.accountName} />
        )}
        {!isEditing && isCard ? (
          <form id="card-form" className={`qa-payment-form`}>
            <div className="payment-option-container__card-cvv-container">
              {isSelected && (
                <div className="payment-option-container__card-cvv">
                  <div>CVV</div>
                  <div>
                    <input
                      name="cvv"
                      className="qa-cvv payment-option-container__card-cvv-form"
                      value={formik.values.cvv}
                      type="password"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const sanitizedValue = e.target.value.replace(
                          /\D/g,
                          ""
                        ); // Allow only numbers
                        if (sanitizedValue.length <= maxLength) {
                          formik.setFieldValue("cvv", sanitizedValue);
                        }

                        // Trigger validation when CVV length matches maxLength
                        if (sanitizedValue.length === maxLength) {
                          onValidCVV(sanitizedValue);
                        } else {
                          const updatedPaymentMethods = paymentMethods.map(
                            (pm) =>
                              pm.paymentMethod.id === paymentMethod.id
                                ? {
                                  ...pm,
                                  isPaymentValidated: false,
                                }
                                : pm
                          );

                          onAddNewCards(updatedPaymentMethods);
                        }
                      }}
                      onBlur={formik.handleBlur}
                      required
                    />
                    <div className="cvv-text">3 or 4 digits</div>
                    <ErrorMessage
                      name="cvv"
                      component="div"
                      className="error-message"
                    />
                    {formik.values.cvvError && !formik.errors.cvv && (
                      <div className="error-message">
                        {formik.values.cvvError}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {isSelected && isCard && (
                <div
                  className="qa-edit-payment payment-option-container__card-cvv-edit"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevents triggering parent click events
                    setIsCardEdit(true);
                    handlePaymentMethodEdit();
                  }}
                >
                  edit
                </div>
              )}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
            </div>
          </form>
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
          onAddNewCard={onAddNewCards}
          setCVVFieldValue={setCVVFieldValue}
          isEditing={isCardEdit}
        />
      )}
    </div>
  );
};
