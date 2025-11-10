import { ErrorMessage } from "formik";
import { useAtom, useSetAtom } from "jotai";
import React, { ChangeEvent, useEffect, useState } from "react";
import { buildOrder } from "../api/service/Order";
import {
  saveCvv,
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
import { useContentStrings } from "../hooks/useContentStrings";
import { getOrderNotifications } from "../utils/OrderUtils";

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
  updateOrderErrorMessage: (newMessage: string) => void;
  siteId: string;
  pcid: string;
  isGuest: boolean;
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
  updateOrderErrorMessage,
  siteId,
  pcid,
  isGuest,
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

   const { getString } = useContentStrings();

  const scrollToPMMain = () => {
    const element = document.getElementById("pm-main");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  useEffect(() => {
    const selectedPayment = paymentMethods.find(
      (pm) => pm.isSelected
    )?.paymentMethod;

    if (!selectedPayment) return;

    const { expMonth, expYear } = selectedPayment;
    if (
      isCardExpired(expMonth as number, expYear as number) &&
      order?.shouldShowInvalidCVVMessage === `${getString("creditCardExpired")}.`
    ) {
      updateCvvError(`${getString("creditCardExpired")}.`);
      scrollToPMMain();
    } else if (
      !order?.isOrderValid &&
      order?.shouldShowInvalidCVVMessage &&
      formik.dirty
    ) {
      updateCvvError(getString("cvvIsRequired") as string);
    } else {
      updateCvvError("");
    }
  }, [order]);

  const maxLength = paymentMethod.typeID === 1 ? 4 : 3;

  const setLoading = useSetAtom(loadingAtom);

  const isSelected = paymentOption.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isCard = !isThirdPartyPayment(paymentMethod.typeID);

  const getCardNumber = (ccNumber: any) => {
    return "*" + ccNumber?.slice(-4);
  };

  useEffect(() => {
    const selectedPayment = paymentMethods.find(
      (pm) => pm.isSelected
    )?.paymentMethod;

    if (!selectedPayment) return;

    const { expMonth, expYear } = selectedPayment;
    if (
      isCardExpired(expMonth as number, expYear as number) &&
      isSelected &&
      !isThirdPartyPayment(paymentMethod.typeID)
    ) {
      setTimeout(() => {
        order &&
          setOrder({
            ...order,
            isOrderValid: false,
            shouldShowInvalidCVVMessage: `${getString("creditCardExpired")}.`,
          });
        return;
      }, 300);
    } else {
      updateCvvError("");
    }
  }, [paymentMethod]);

  const handlePaymentMethodEdit = () => {
    if (isSelected && paymentMethod) {
      onCardEdit(paymentMethod.id);
      if(formik.values.cvv){ //clear out cvv if something was entered
        setCVVFieldValue("");
      }
    }
  };

  const onChangePaymentMethod = () => {
    const previouslySelectedPayment = paymentMethods.find(
      (pm) => pm.isSelected
    );
    updateOrderErrorMessage("");
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

    const isThirdPartyPayment = thirdPartyPaymentTypeIdList().includes(
      paymentOption.paymentMethod.typeID
    );

    // Skip validation if it's a third-party payment
    if (isThirdPartyPayment) {
      setLoading(false);
      return;
    }

    try {

      await saveCvv(shopperId, paymentMethod.id, cvv);

      // Prevent re-validating if already validated
      if (isPaymentValidated) {
        setLoading(false);
        return;
      }

      const hasPaymentChanged = order?.paymentMethod?.id !== paymentMethod.id;

      // Update order with validated payment method -
      // AI-110718 only call this if the payment method has been updated, build order takes too long when only cvv is entered
      if(!order?.paymentMethod?.id || hasPaymentChanged){
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
        }, pcid);

        const orderResponse = await buildOrder(updatedOrder);

        if (getOrderNotifications(orderResponse.response.success).length > 0) {
            setLoading(false);
            setOrderNotifications(
              getOrderNotifications(orderResponse.response.success)
              );
          setOrder({ ...orderResponse.response.success.data });
      }
        setOrder({
          ...orderResponse.response.success.data,
          isOrderValid: true,
          shouldShowInvalidCVVMessage: null,
        });
    }
      // Reset all payment methods, only keep the validated one
      const updatedPaymentMethods = paymentMethods.map((method) => ({
        ...method,
        isSelected: method?.paymentMethod.id === paymentOption?.paymentMethod.id,
        isPaymentValidated:
          method.paymentMethod.id === paymentOption?.paymentMethod.id,
      }));

      onAddNewCards(updatedPaymentMethods);

      // Reset CVV input in formik
      formik.setFieldValue("cvvError", "");
      formik.setFieldValue("cvv", cvv);
    } catch (error) {
      console.log(error);
      setOrder({ ...order, isOrderValid: false });
      setErrorMessage(getString("unexpectedErrorTryAgain") as string); 
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

  const isCardExpired = (expMonth: number, expYear: number) => {
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
                {getString("expires")} {paymentMethod.expires}
              </div>
            </div>
          )}
          {isEditing && !isCardEdit && isCard && (
            <div className="payment-option-add-container__card">
              <div className="payment-option-add-container__card-title">
                {getString("creditOrDebitCard")}
              </div>
              <div className="payment-creditcard-wrapper">
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
          <form id="card-form" className={`qa-payment-form`} autoComplete="off">
            <div className="payment-option-container__card-cvv-container">
              {isSelected && (
                <div className="payment-option-container__card-cvv">
                  <div className="payment-option-container__card-cvv-text">
                    {getString('cvv')}
                  </div>
                  <div>
                    <div className="cvv-input-wrapper">
                    <input
                      name="cvv"
                      className={`qa-cvv payment-option-container__card-cvv-form ${
                        errorMessage ||
                        formik.errors.cvv ||
                        (formik.values.cvvError && !formik.errors.cvv)
                          ? "cvv-error"
                          : ""
                      }`}
                      value={formik.values.cvv}
                      type="text"
                      pattern="\d*"
                      aria-hidden="true"
                      data-1p-ignore
                      data-lpignore="true"
                      data-protonpass-ignore="true"
                      data-autocompletetype="off"
                      maxLength={maxLength}
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const sanitizedValue = formik.values.cvv?.replace(/\D/g, "");
                          if (sanitizedValue?.length === maxLength) {
                            onValidCVV(sanitizedValue);
                          }
                        }
                      }}
                      onBlur={formik.handleBlur}
                      required
                    />
                    {(errorMessage ||
                      formik.errors.cvv ||
                      (formik.values.cvvError && !formik.errors.cvv)) && (
                      <span className="material-symbols-outlined cvv-error-icon">
                        error
                      </span>
                    )}
                    </div>
                    <div className="cvv-text">{maxLength} {getString("digits")}</div>
                    {errorMessage ||
                      (formik.errors.cvv && (
                        <span className="error-message">
                          {errorMessage ?? formik.errors.cvv}
                        </span>
                      ))}
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
                  {getString("edit")?.toLocaleLowerCase()}
                </div>
              )}
            </div>
          </form>
        ) : null}
      </div>

      {!isCard && isSelected && (
        <ThirdPartyLinkOff paymentMethod={paymentMethod} />
      )}

      {isEditing && (
        <>
          <hr className="payment-divider" />
          <CardInformation
            paymentMethod={paymentMethod}
            address={paymentAddress}
            isPaymentValidated={isPaymentValidated}
            isTempPaymentMethod={isTempPaymentMethod}
            updatePaymentValidationStatus={updatePaymentValidationStatus}
            shopperId={shopperId}
            onCancel={handleCancelNewCard}
            onAddNewCard={onAddNewCards}
            setCVVFieldValue={setCVVFieldValue}
            isEditing={isCardEdit}
            siteId={siteId}
            pcid={pcid}
            isGuest={isGuest}
          />
        </>
      )}
    </div>
  );
};
