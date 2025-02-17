import { ErrorMessage, FormikProvider, useFormik } from "formik";
import { useAtom, useSetAtom } from "jotai";
import { debounce } from "lodash";
import React, { ChangeEvent, useEffect, useState } from "react";
import * as Yup from "yup";
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

export interface IPaymentOptionProps {
  handleCancelNewCard: () => void;
  paymentOption: IPaymentOption;
  onAddNewCards: (paymentOptions: IPaymentOption[]) => void;
  shopperId: string;
  onCardEdit: (id: number) => void;
  index: number;
  onCollapse: () => void;
  updatePaymentTypeId: (newValue: number) => void;
}

export const PaymentOption: React.FC<IPaymentOptionProps> = ({
  index,
  shopperId,
  onCardEdit,
  onCollapse,
  paymentOption,
  onAddNewCards,
  handleCancelNewCard,
  updatePaymentTypeId,
}) => {
  const [order, setOrder] = useAtom(orderAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethods] = useAtom(paymentMethodsAtom);

  const {
    paymentMethod,
    paymentAddress,
    isPaymentValidated,
    isTempPaymentMethod,
    isEditing,
  } = paymentOption;

  const maxLength = paymentMethod.typeID === 1 ? 4 : 3;

  const formik = useFormik({
    initialValues: {
      cvv: "",
    },
    validationSchema: Yup.object().shape({
      cvv: Yup.string()
        .matches(/^\d+$/, "CVV must be numeric")
        .min(maxLength, "CVV must be 3 or 4 digits")
        .max(maxLength, "CVV must be 3 or 4 digits")
        .required("CVV is required"),
    }),
    onSubmit: (values) => {
      if (values.cvv.length === maxLength) {
        onValidCVV(values.cvv);
      }
    },
  });

  const setLoading = useSetAtom(loadingAtom);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard =
    paymentMethod.accountName !== PAYPAL.name &&
    paymentMethod.accountName !== SEZZLE.name;

  const getCardNumber = (ccNumber: any) => {
    return "*" + ccNumber?.slice(-4);
  };

  const handlePaymentMethodEdit = () => {
    if (isSelected && paymentMethod) {
      onCardEdit(paymentMethod.id);
    }
  };

  const onChangePaymentMethod = () => {
    // Find currently selected and validated payment method
    const previouslySelectedPayment = paymentMethods.find(
      (pm) => pm.isSelected && pm.isPaymentValidated
    );

    const updatedPaymentOptions = paymentMethods.map((method) => {
      const isPayPalOrSezzle =
        method.paymentMethod.typeID === PAYPAL.typeId ||
        method.paymentMethod.typeID === SEZZLE.typeId;

      return method.paymentMethod.id === paymentOption.paymentMethod.id
        ? {
            ...method,
            isSelected: true,
            isVisible: true, // Always make selected payment visible
            isPaymentValidated: method.isPaymentValidated, // Keep current validation status
          }
        : {
            ...method,
            isSelected: false,
            isEditing: false,
            isPaymentValidated: false, // Reset validation only when switching
            isVisible: isPayPalOrSezzle ? true : method.isVisible, // Keep PayPal and Sezzle always visible
          };
    });

    // Reset the form ONLY IF the previous card was validated and user switched cards
    if (
      previouslySelectedPayment &&
      previouslySelectedPayment.paymentMethod.id !==
        paymentOption.paymentMethod.id
    ) {
      formik.resetForm();
    }

    if (order) {
      setOrder({
        ...order,
        isOrderValid:
          paymentMethod.typeID === PAYPAL.typeId ||
          paymentMethod.typeID === SEZZLE.typeId,
      });
    }

    updatePaymentTypeId(paymentOption.paymentMethod.typeID ?? 0);
    onAddNewCards(updatedPaymentOptions);
  };

  const onValidCVV = async (cvv: string) => {
    setLoading(true);

    if (!order) {
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

      // // If the validation fails, stop execution
      // if (!isPaymentMethodValid) {
      //   throw new Error("Invalid CVV");
      // }

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

  return (
    <div
      className={`payment-option-container ${isSelected} ${isFirst}`}
      onClick={onChangePaymentMethod}
      id={`[id=${paymentMethod.id}]`}
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
          <FormikProvider value={formik}>
            <form id="card-form">
              <div className="payment-option-container__card-cvv-container">
                {isSelected && (
                  <div className="payment-option-container__card-cvv">
                    <div>CVV</div>
                    <div>
                      <input
                        name="cvv"
                        className="payment-option-container__card-cvv-form"
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
                      {!formik.touched.cvv &&
                        !formik.dirty &&
                        order?.shouldShowInvalidCVVMessage && (
                          <div className="error-message">Required</div>
                        )}
                    </div>
                  </div>
                )}
                {isSelected && isCard && (
                  <div
                    className="payment-option-container__card-cvv-edit"
                    onClick={(event) => {
                      event.stopPropagation(); // Prevents triggering parent click events
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
          </FormikProvider>
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
          setCVVFieldValue={formik.setFieldValue}
        />
      )}
    </div>
  );
};
