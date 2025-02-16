import { ErrorMessage, Field, Formik, FormikProvider, useFormik } from "formik";
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
    // Set editing to false if switching to a different payment method

    // Update payment methods with the selected method

    const updatedPaymentOptions = paymentMethods.map((method) => {
      if (
        method.paymentMethod.id !== paymentOption.paymentMethod.id &&
        method.isPaymentValidated
      ) {
        formik.resetForm();
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
    onAddCardAndUpdate(updatedPaymentOptions);
  };

  const debouncedOnValidCVV = debounce((input: string, maxLength: number) => {
    if (order) {
      setOrder({ ...order, isOrderValid: false });
    }
    if (input.length === maxLength) {
      onValidCVV(input);
    }
  }, 300);

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
                isPaymentValidated: false,
              }
        );

        onAddCardAndUpdate(updatedPaymentOptions);
      }

      setLoading(false);
    }
  };

  // cleanup function
  useEffect(() => {
    return () => debouncedOnValidCVV.cancel();
  }, []);

  const onAddCardAndUpdate = (paymentOptions: IPaymentOption[]) => {
    onAddNewCards(paymentOptions);
  };

  const updatePaymentValidationStatus = (id: number) => {
    // Update payment methods with the selected method
    const updatedPaymentOptions = paymentMethods.map((method) => ({
      ...method,
      paymentMethod: {
        ...paymentMethod,
        cvv: 1,
      },
      isPaymentValidated: method.paymentMethod.id === id ? true : false,
    }));

    onAddCardAndUpdate(updatedPaymentOptions);
  };

  const cvvValidationSchema = Yup.object().shape({
    cvv: Yup.string()
      .matches(/^\d+$/, "CVV must be numeric")
      .min(maxLength, "CVV must be 3 or 4 digits")
      .max(maxLength, "CVV must be 3 or 4 digits")
      .required("CVV is required"),
  });

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
            <form>
              <div className="payment-option-container__card-cvv-container">
                {isSelected && (
                  <div className="payment-option-container__card-cvv">
                    <div>CVV</div>
                    <div>
                      <Field
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
          onAddNewCard={onAddCardAndUpdate}
        />
      )}
    </div>
  );
};
