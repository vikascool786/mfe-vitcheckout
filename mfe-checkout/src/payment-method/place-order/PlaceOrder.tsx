import { loadScript } from "@paypal/paypal-js";
import { Formik } from "formik";
import { useAtom } from "jotai/index";
import React, { memo, SetStateAction, useEffect, useState } from "react";
import { fetchSezzleUrl } from "../../api/ajaxaction/Sezzle";
import { getTransactionData } from "../../api/service/Click2PayTransaction";
import { buildOrder, changeOrder } from "../../api/service/Order";
import {
  addTempPaymentMethod,
  generatePayPalTransactionDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { fetchSiteFlagData } from "../../api/service/SiteFlags";
import { siteApiData } from "../../checkout/siteAtom";
import { Button } from "../../component/Button/Button";
import { Checkbox } from "../../component/Form/Checkbox/Checkbox";
import { Address } from "../../interfaces/Address";
import { Order } from "../../interfaces/Order";
import { OrderConsolidationData } from "../../interfaces/OrderConsolidationData";
import Click2PayPlaceOrder from "../../payment-method-click2pay/Click2PayPlaceOrder";
import { Back } from "../../assets/svgs/Back";
import {
  // cvvValidAtom,
  IPaymentOption,
  orderNotificationsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { generateOrderTrackingId } from "../../utils/helpers/GenerateOrderTrackingId";
import {
  getOrderConsolidateData,
  orderHasAutoshipItems, orderHasShippingAddress,
} from "../../utils/OrderUtils";
import {
  GET_PAYPAL_CHECKOUT_URL,
  GET_PAYPAL_CLIENT_ID,
} from "../../utils/urlResolver";
import { placeOrderSchema } from "../../validation/placeOrderSchema";
import { CLICK2PAY, isPaypalPayment, isThirdPartyPayment, PAYPAL, PAYPAL_RECURRING, SEZZLE } from "../PaymentType";
import "./PlaceOrder.scss";
import { useCreditCardFormContext } from "../../component/Form/CreditCardFormContext";
import { handleSaveCard } from "../../utils/helpers/CreditCardHelper";
import { useContentStrings } from "../../hooks/useContentStrings";
import { getPaypalToken } from "../../api/service/PaypalCheckout";

interface IPlaceOrder {
  confirmOrder: () => void;
  billingId: number;
  shippingId: number;
  errorMessage: string;
  paymentTypeId: number;
  shopperId: string;
  siteId: string;
  order?: Order;
  paymentMethods: IPaymentOption[];
  setOrderData: any;
  isLoading: boolean;
  setIsLoading: any;
  updateOrderErrorMessage: (newMessage: string) => void;
  setIsAutoShipChecked: React.Dispatch<SetStateAction<boolean>>;
  setMobileRequiredMessage: React.Dispatch<SetStateAction<boolean>>;
  hasPhoneError: boolean;
  isAutoShipChecked: boolean;
  isCheckboxChecked: boolean;
}

const PlaceOrder: React.FC<IPlaceOrder> = ({
  confirmOrder,
  setOrderData,
  paymentMethods,
  errorMessage,
  paymentTypeId,
  shopperId,
  siteId,
  order,
  isLoading,
  setIsLoading,
  updateOrderErrorMessage,
  setIsAutoShipChecked,
  setMobileRequiredMessage,
  isAutoShipChecked,
  hasPhoneError,
  isCheckboxChecked
}) => {
  const trackingData = new Map<string, string>();
  const [siteData] = useAtom(siteApiData(siteId));
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const selectedPaymentMethod = paymentMethods.find((pm) => pm.isSelected);
  const { getString } = useContentStrings();
  const [orderConsolidateData, setOrderConsolidateData] =
    useState<OrderConsolidationData>(getOrderConsolidateData(order || null,getString));

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { creditCardFormData } = useCreditCardFormContext();

  const [paypalTokenId, setPaypalTokenId ] = useState<String>("");
  const [paypalRecurringUrl, setPaypalRecurringUrl ] = useState<String>("");

  useEffect(() => {
    updateOrderErrorMessage("");
    if (order) {
      setOrderConsolidateData(getOrderConsolidateData(order,getString));
    }
  }, [order]);

  useEffect(() => {
    if(isPaypalPayment(paymentTypeId) && order){
      const isRecurring = PAYPAL_RECURRING.typeId === paymentTypeId;
      const tokenResponse = getPaypalToken(shopperId, isRecurring, order?.totals.price)
      tokenResponse
          .then((response) => {
            if(isRecurring){
              setPaypalTokenId(response.data.token_id);
              const approvalUrl = response.data.links.find((link: { rel: string; href: string }) =>
                  link.rel === "approval_url"
              )?.href || "";
              setPaypalRecurringUrl(approvalUrl);
            }else{
              setPaypalTokenId(response.tokenId);
            }
          })
    } else {
      setPaypalTokenId("");
      setPaypalRecurringUrl("");
    }
  }, [paymentTypeId]);

  useEffect(() => {
    const getQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      return {
        token: params.get("token"),
        payerId: params.get("PayerID"),
        baToken: params.get("ba_token"),
        isRecurring: !!params.get("isRecurring"),
        status: !!params.get("status"),
      };
    };

    const { token, payerId, baToken, isRecurring, status } = getQueryParams();

    const isPaypalCallback = !!(token && payerId);
    const isRecurringPaypalCallback = !!(baToken && isRecurring);
    const isCanceledCallback = status;

    const fetchPayPalTransactionDetails = async () => {
      setIsLoading(true);

      if (isPaypalCallback || isRecurringPaypalCallback) {
        const transactionToken = isRecurringPaypalCallback ? baToken : token || "";
        try {
          const response = await generatePayPalTransactionDetails(
            shopperId,
              transactionToken,
            true,
            isRecurring
          );

          if (order) {
            const changeOrderDetails = generateChangeStoreResponse(order);

            delete response.paymentMethod["id"];

            trackingData.set("paypal", response.callID);

            await changeOrder(
              {
                ...changeOrderDetails,
                paymentMethod: {
                  ...response.paymentMethod,
                },
                userOptions: {
                  ...changeOrderDetails.userOptions,
                  trackingID: generateOrderTrackingId(trackingData),
                },
              },
              order?.id
            );

            confirmOrder();
          }
        } catch (error) {
          console.error("Error processing PayPal order:", error);
          setIsLoading(false);
        }
      }
    };

    if ((isPaypalCallback || isRecurringPaypalCallback) && !isCanceledCallback) {
      fetchPayPalTransactionDetails();
    }
  }, []); // Ensure dependencies are correctly handled

  const onToggleAccordion = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setTimeout(() => {
        const placeOrderBtn = document.getElementById("mfe-place-order-btn")!;
        const container = document.getElementById("mfe-checkout-container")!;
        const containerRect = container.getBoundingClientRect();
        const elementRect = placeOrderBtn.getBoundingClientRect();
        if (elementRect && containerRect) {
          const isVisible =
            elementRect.top >= 0 &&
            elementRect.bottom <= window.innerHeight &&
            elementRect.left >= 0 &&
            elementRect.right <= window.innerWidth;
          if (elementRect.top > containerRect.top && !isVisible) {
            window.scrollTo({
              top: elementRect.top + containerRect.bottom * 0.7,
              behavior: "smooth",
            });
          }
        }

        // placeOrderBtn?.scrollIntoView({
        //   behavior: "smooth",
        //   block: "start",
        // });
      }, 0);
    }
  };

  const scrollToCVV = (selectedPaymentMethod: IPaymentOption) => {
    if (!selectedPaymentMethod?.paymentMethod?.id) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const section = document.getElementById(
      `[id=${selectedPaymentMethod.paymentMethod.id}]`
    );

    if (section) {
      var headerOffset = 80;
      var elementPosition = section.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      console.warn(
        "Element not found:",
        selectedPaymentMethod.paymentMethod.id
      );
    }
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

  const handlePlaceOrder = async (paymentMethods: IPaymentOption[]) => {
    setIsLoading(true);
   
    if (hasPhoneError && isCheckboxChecked) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
      setIsLoading(false);
      setMobileRequiredMessage(true);
      return;
    }

    const hasNewCreditCardDataToSave =
      (creditCardFormData?.cardInfo?.number ?? "").length > 0;

    const isOrderCoveredUnderVIFT =
      order?.userOptions.applyEWallet && order.totals.price === 0;

    const isOrderCoveredByGiftCard =
      order?.userOptions?.gcNum && order.totals.price === 0;

    const isCreditCardRequired =
      !isOrderCoveredUnderVIFT && !isOrderCoveredByGiftCard;

    if (isCreditCardRequired && selectedPaymentMethod?.paymentMethod.id === 0) {
      if (!hasNewCreditCardDataToSave) {
        updateOrderErrorMessage(getString("completePaymentInfo") as string);
        setIsLoading(false);
        return;
      } else {
        const saveCardResponse = await handleSaveCard(
          creditCardFormData,
          shopperId,
          { order },
          getString
        );
        if (saveCardResponse?.error) {
          updateOrderErrorMessage(saveCardResponse.error);
          setIsLoading(false);
          return;
        } else {
          if (saveCardResponse?.updatedOrder) {
            order = saveCardResponse.updatedOrder;
            selectedPaymentMethod.isPaymentValidated = true;
          }
        }
      }
    }

    //confirm we have a shipping address for the order
    if (!orderHasShippingAddress(order)) {
      updateOrderErrorMessage(getString("selectShippingAddress") as string);
      setIsLoading(false);
      return;
    }

    try {
      const excludedPaymentTypes = [48, 56, 60];

      if (
        selectedPaymentMethod?.isEditing &&
        selectedPaymentMethod?.paymentMethod.id !== 0
      ) {
        updateOrderErrorMessage(getString("pleaseSavePayment") as string);
        setIsLoading(false);
        return;
      }

      if (isCreditCardRequired) {
        if (selectedPaymentMethod?.paymentMethod.id) {
          if (
            !excludedPaymentTypes.includes(paymentTypeId) &&
            !selectedPaymentMethod?.isPaymentValidated &&
            selectedPaymentMethod?.isEditing
          ) {
            updateOrderErrorMessage(getString("pleaseSavePayment") as string);
            setIsLoading(false);
          }
          if (selectedPaymentMethod?.isEditing) {
            return;
          }
        } else if (
          !selectedPaymentMethod?.paymentMethod.id ||
          (orderNotifications && orderNotifications?.length > 0)
        ) {
          if (
            !excludedPaymentTypes.includes(paymentTypeId) &&
            !selectedPaymentMethod?.isPaymentValidated
          ) {
            updateOrderErrorMessage(getString("pleaseSavePayment") as string);
            setIsLoading(false);
            return;
          }
        }
      }

      if (
        (isOrderCoveredUnderVIFT || isOrderCoveredByGiftCard) &&
        orderHasAutoshipItems(order || null)
      ) {
        if (
          selectedPaymentMethod?.paymentMethod.id &&
          selectedPaymentMethod.isEditing
        ) {
          if (
            !excludedPaymentTypes.includes(paymentTypeId) &&
            !selectedPaymentMethod?.isPaymentValidated
          ) {
            updateOrderErrorMessage(getString("pleaseSavePayment") as string);
            setIsLoading(false);
          }
        } else if (
          !selectedPaymentMethod?.paymentMethod.id ||
          (orderNotifications && orderNotifications?.length > 0)
        ) {
          if (
            !excludedPaymentTypes.includes(paymentTypeId) &&
            !selectedPaymentMethod?.isPaymentValidated
          ) {
            updateOrderErrorMessage(getString("pleaseSavePayment") as string);
            setIsLoading(false);
            return;
          }
        }
      }

      if (!order?.shippingAddress.address1) {
        window.scrollTo(0, 0);
        return;
      }
      paymentTypeId =
        selectedPaymentMethod?.paymentMethod.typeID || paymentTypeId;

      switch (paymentTypeId) {
        case CLICK2PAY.typeId:
          await handleClick2PayOrderUpdate();
          confirmOrder();
          break;
        case SEZZLE.typeId:
          await handleSezzleOrder();
          break;
        case PAYPAL.typeId:
          await handlePaypalOrderRedirect(false);
          break;
        case PAYPAL_RECURRING.typeId:
          await handlePaypalOrderRedirect(true);
          break;
        default:
          const selectedPaymentMethod = paymentMethods.find(
            (pm) => pm.isSelected
          );

          const isCardExpiredFlag = isCardExpired(
            selectedPaymentMethod?.paymentMethod.expMonth || 0,
            selectedPaymentMethod?.paymentMethod.expYear || 0
          );

          if (isCardExpiredFlag && !isThirdPartyPayment(paymentTypeId)) {
            order &&
              setOrderData({
                ...order,
                shouldShowInvalidCVVMessage: `${getString("creditCardExpired")}.`,
              });
            setIsLoading(false);
            return;
          }

          if (
            isCreditCardRequired &&
            selectedPaymentMethod &&
            !selectedPaymentMethod.isPaymentValidated &&
            order
          ) {
            let message = getString("checkCvv") as string;

            if (isCardExpiredFlag) {
              message = `${getString("creditCardExpired")}.`;
            }

            if (
              order.shouldShowInvalidCVVMessage &&
              message === `${getString("creditCardExpired")}.`
            )
              break;

            setOrderData({
              ...order,
              shouldShowInvalidCVVMessage: message,
            });
            scrollToCVV(selectedPaymentMethod);
            setIsLoading(false);
            return;
          }
          if (
            (isOrderCoveredUnderVIFT || isOrderCoveredByGiftCard) &&
            orderHasAutoshipItems(order) &&
            selectedPaymentMethod &&
            !selectedPaymentMethod.isPaymentValidated
          ) {
            order &&
              setOrderData({
                ...order,
                shouldShowInvalidCVVMessage:
                  order?.shouldShowInvalidCVVMessage ===
                  `${getString("creditCardExpired")}.`
                    ? order.shouldShowInvalidCVVMessage
                    : getString("checkCvv"),
              });
            scrollToCVV(selectedPaymentMethod);
            setIsLoading(false);
            return;
          }
          setIsLoading(true);
          await handleFinalPlaceOrderUpdate();
          confirmOrder();
          break;
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
          error?.response?.data?.message || error?.message || "We're sorry, there was an error placing your order";
      updateOrderErrorMessage(errorMessage);
    }
  };

  const handlePaypalOrderRedirect = async (isRecurring: boolean) => {
    // fetch paypal site flags
    const siteFlags = await fetchSiteFlagData(siteId, "393");
    const data = JSON.parse(siteFlags[0].auxDataText);

    // loading paypal sdk
    loadScript({
      clientId: GET_PAYPAL_CLIENT_ID(), // Your PayPal Client ID
      merchantId: data.merchantId, // Optional: Specify merchant ID
      environment: data.environment, // Use "sandbox" or "production"
      currency: "USD", // Set your currency
      intent: "capture", // "capture" for immediate payment
      components: "buttons",
    })
        .then((paypal) => {
          if (!paypal) {
            console.error("PayPal SDK failed to load correctly");
            return;
          }
          // console.log("PayPal SDK loaded:", paypal);
        })
        .catch((error) =>
            console.error("PayPal SDK failed to load", error)
        );

    if (paypalTokenId.length < 1) {
      alert("Failed to fetch PayPal token, check console for message");
      setIsLoading(false);
      return;
    }
    const url = getPaypalUrl(isRecurring);
    window.open(url, "_self");
  }

  const getPaypalUrl = (isRecurring: boolean) => {
    const paypalRedirectUrl = isRecurring ? paypalRecurringUrl : `${GET_PAYPAL_CHECKOUT_URL()}?token=${
        paypalTokenId
    }`;

    return `${paypalRedirectUrl}&useraction=commit`;
  }

  const handleFinalPlaceOrderUpdate = () => {
    if (!order) return;
    if (order) {
      return buildOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            trackingID: generateOrderTrackingId(trackingData),
          },
        })
      );
    }
  };

  const getClickToPayTransactionData = async (
    flowId: string,
    transId: string,
    total: string
  ) => {
    try {
      const response = await getTransactionData(flowId, transId, total);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      const errorMessage =
          error?.response?.data?.message || error?.message || "Unknown error";
      throw new Error(errorMessage);
    }
  };

  const handleClick2PayOrderUpdate = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let c2pBillingAddress: Address = {
        first: "",
        last: "",
        address1: "",
        city: "",
        state: "",
        zip: "",
      };
      const digitalCardId = Click2PayPlaceOrder.getDigitalCardId();
      const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(
        // @ts-ignore
        window.c2pInstance,
        digitalCardId
      );

      c2pPlaceOrderPromise
        .then((response: any) => {
          if (response.checkoutActionCode === "COMPLETE") {
            const transId = response.headers["merchant-transaction-id"];
            const flowId = response.headers["x-src-cx-flow-id"];
            const total = order ? order.totals.price.toString() : "0";
            trackingData.set("transactionId", transId);
            trackingData.set("flowId", flowId);

            return getClickToPayTransactionData(flowId, transId, total);
          } else {
            throw new Error("Click2pay checkoutActionCode not Complete");
          }
        })
        .then((response: any) => {
          const paymentMethodResponse = response.data.paymentMethod;
          const walletData = {
            name: paymentMethodResponse.accountName,
            number: paymentMethodResponse.number,
            token: paymentMethodResponse.token,
            month: paymentMethodResponse.expMonth,
            year: paymentMethodResponse.expYear,
            type: paymentMethodResponse.typeID,
          };

          c2pBillingAddress = response.data.billing;
          c2pBillingAddress.country = siteData.siteCountryCode;

          return addTempPaymentMethod(shopperId, walletData);
        })
        .then((response: any) => {
          const paymentId = response.id;
          if (order) {
            return buildOrder(
              generateChangeStoreResponse({
                ...order,
                paymentMethod: {
                  ...order.paymentMethod,
                  id: paymentId,
                },
                billingAddress: c2pBillingAddress,
                userOptions: {
                  ...order.userOptions,
                  trackingID: generateOrderTrackingId(trackingData),
                },
              })
            );
          }
        })
        .then(() => {
          console.log("Click2pay place order completed successfully");
          resolve(); // Fulfill the outer promise
        })
        .catch((error: { message: string }) => {
          console.error("c2p place order failed: " + error.message);
          reject(error); // Reject the outer promise
        });
    });
  };

  const handleSezzleOrder = async () => {
    const total = order ? order.totals.price.toString() : "0";
    const tempOrderId = order ? order.userOptions?.tempOrderID : "0";
    const sezzleResponse = await fetchSezzleUrl(total, tempOrderId);
    if (typeof sezzleResponse.url != "undefined") {
      window.location = sezzleResponse.url;
    } else {
      let errMsg = getString("sezzleConnectionError") as string;
      if (typeof sezzleResponse.error != "undefined") {
        errMsg = sezzleResponse.error;
      }
      updateOrderErrorMessage(errMsg);
      throw new Error(errMsg);
    }
  };

  // if (isLoading) {
  //   return <Spinner />;
  // }

  return (
    <div className="checkout-place-order margin-5">
      <Formik
        initialValues={{ autoshipTerms: !orderHasAutoshipItems(order || null) }}
        validationSchema={placeOrderSchema(getString)}
        onSubmit={() => handlePlaceOrder(paymentMethods)}
      >
        {({ touched, errors, setFieldValue, submitForm, values }) => (
          <form>
            {orderHasAutoshipItems(order || null) && (
              <div className="checkout-place-order-autoship checkout-place-order-text">
                <div className="checkout-place-order-text__flex">
                  <div className="checkout-place-order-text__heading">
                    {getString("autoShipTermsAndConditions")}
                  </div>
                  <Back
                    className={`qa-expand mfe-accordion ${
                      isExpanded ? "open" : "close"
                    }`}
                    onClick={onToggleAccordion}
                  />
                </div>
                <div
                  className={`checkout-place-order-text__box ${
                    isExpanded
                      ? "checkout-place-order-text__open"
                      : "checkout-place-order-text__close"
                  }`}
                >
                  <div className="checkout-place-order-text">
                    {getString("autoShipAgreement")}
                  </div>
                  <div className="checkout-place-order-text__note">
                   {getString("shipTaxAdjustAtTimeOfPulling")}
                  </div>
                </div>

                <Checkbox
                  name="autoshipTerms"
                  title="I agree to the Autoship Terms & Conditions"
                  checked={isAutoShipChecked}
                  onChange={() => {
                    setIsAutoShipChecked(!values.autoshipTerms);
                    setFieldValue("autoshipTerms", !values.autoshipTerms);
                  }}
                  errorMessage={touched.autoshipTerms && errors.autoshipTerms}
                />
              </div>
            )}
            <div className="checkout-place-order-text-terms-policy">
              {getString("agreeToTerms")}{" "}
              <a
                href="/info/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getString("termsOfUse")}
              </a>{" "}
              and{" "}
              <a
                href="/info/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getString("privacyPolicy")}
              </a>
              .
            </div>
            {errorMessage.length > 0 && (
              <div className="error-message-order">
                {/* <div className="error-message-order--bold">
                  Please complete your payment information
                </div> */}
                <div className="error-message-order--bold">{errorMessage}</div>
              </div>
            )}
            {orderConsolidateData.oosConsolidate === 2 && (
              <div className="alert-message">
                {getString("chargedWhenShipped")}
              </div>
            )}
            <Button
              id="mfe-place-order-btn"
              qaTag={"qa-order"}
              label={
                isLoading
                  ? `${getString("loading")}...`
                  : paymentTypeId === SEZZLE.typeId ||
                    isPaypalPayment(paymentTypeId) ||
                    paymentTypeId === CLICK2PAY.typeId
                  ? getString("payWith") as string
                  : (getString("placeOrder") as string)
              }
              disabled={isLoading || (isCheckboxChecked && hasPhoneError)}
              btnType={
                paymentTypeId === SEZZLE.typeId
                  ? "sezzle"
                  : isPaypalPayment(paymentTypeId)
                  ? "paypal"
                  : "primary"
              }
              onClick={submitForm}
              logo={
                paymentTypeId === SEZZLE.typeId
                  ? "https://img.shop.com/Image/resources/checkout/Sezzle-Color-White-Logo.svg"
                  : isPaypalPayment(paymentTypeId)
                  ? "https://img.shop.com/Image/resources/checkout/PayPal-White-Logo.svg"
                  : paymentTypeId === CLICK2PAY.typeId
                  ? "https://img.shop.com/Image/resources/checkout/click-to-pay-white.svg"
                  : ""
              }
            />
          </form>
        )}
      </Formik>
    </div>
  );
};

export default memo(PlaceOrder);