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
import { useSiteFlags } from "../../hooks/useSiteFlags";
import { getPaypalToken } from "../../api/service/PaypalCheckout";
import { isIOSSafari } from "../../utils/helpers/UserAgentHelper";

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
  setMobileRequiredMessage: React.Dispatch<SetStateAction<boolean>>;
  hasPhoneError: boolean;
  isCheckboxChecked: boolean;
  pcid: string;
  isGuest: boolean;
  isGuestEmailValid: boolean;
  cartId: string;
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
  setMobileRequiredMessage,
  hasPhoneError,
  isCheckboxChecked,
  pcid,
  isGuest,
  cartId,
  isGuestEmailValid,
}) => {
  const trackingData = new Map<string, string>();
  const [siteData] = useAtom(siteApiData(siteId));
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const selectedPaymentMethod = paymentMethods.find((pm) => pm.isSelected);
  const { getString } = useContentStrings();
  const { siteFlags } = useSiteFlags();
  const [orderConsolidateData, setOrderConsolidateData] =
    useState<OrderConsolidationData>(getOrderConsolidateData(order || null, getString));

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { creditCardFormData } = useCreditCardFormContext();

  const [paypalTokenId, setPaypalTokenId] = useState<String>("");
  const [paypalRecurringUrl, setPaypalRecurringUrl] = useState<String>("");

  useEffect(() => {
    if (paymentTypeId) {
      localStorage.setItem("selectedPaymentTypeId", paymentTypeId.toString());
    }
  }, [paymentTypeId]);   
  
  useEffect(() => {
    updateOrderErrorMessage("");
    if (order) {
      setOrderConsolidateData(getOrderConsolidateData(order, getString));
    }
  }, [order]);

  useEffect(() => {
    if (isPaypalPayment(paymentTypeId) && order) {
      const isRecurring = PAYPAL_RECURRING.typeId === paymentTypeId;
      const ppShopperId = isGuest ? cartId : shopperId;
      const tokenResponse = getPaypalToken(ppShopperId, isRecurring, order?.totals.price, isGuest)
      tokenResponse
        .then((response) => {
          if (isRecurring) {
            setPaypalTokenId(response.data.token_id);
            const approvalUrl = response.data.links.find((link: { rel: string; href: string }) =>
              link.rel === "approval_url"
            )?.href || "";
            setPaypalRecurringUrl(approvalUrl);
          } else {
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
        const ppShopperId = isGuest ? cartId : shopperId;
        try {
          const response = await generatePayPalTransactionDetails(
            ppShopperId,
            transactionToken,
            true,
            isRecurring
          );

          if (order) {
            const changeOrderDetails = generateChangeStoreResponse(order, pcid);

            delete response.paymentMethod["id"];

            trackingData.set("paypal", response.callID);

            const changeOrderPayload = {
              ...changeOrderDetails,
              paymentMethod: {
                ...response.paymentMethod,
              },
              userOptions: {
                ...changeOrderDetails.userOptions,
                trackingID: generateOrderTrackingId(trackingData),
              },
            };

            const orderBillingAddress = response.billing ?? order?.shippingAddress; //use billing from token response, otherwise fall back to shipping
            if (orderBillingAddress) {
              changeOrderPayload.billing = {
                ...orderBillingAddress,
              };
            }

            await changeOrder(changeOrderPayload, order?.id);

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
      order?.userOptions.applyEWallet && order?.totals.price === 0;

    const isOrderCoveredByGiftCard =
      order?.userOptions?.gcNum && order?.totals.price === 0;

    let isCreditCardRequired =
      !isOrderCoveredUnderVIFT && !isOrderCoveredByGiftCard;

    if(isOrderCoveredUnderVIFT){
        isCreditCardRequired = false;
    }
    if (isCreditCardRequired && selectedPaymentMethod?.paymentMethod.id === 0) {
      if (!hasNewCreditCardDataToSave) {
        updateOrderErrorMessage(getString("completePaymentInfo") as string);
        setIsLoading(false);
        return;
      } else {
        const saveCardResponse = await handleSaveCard(
          creditCardFormData,
          shopperId,
          pcid,
          { order },
          isGuest,
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

        // If order is fully covered under VIFT or gift card, skip sending payment method
      if (
        (isOrderCoveredUnderVIFT || isOrderCoveredByGiftCard)
      ) {

        await handleFinalPlaceOrderUpdateWithoutPaymentMethods();
        confirmOrder();
        return;
      }

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

          let isCardExpiredFlag = isCardExpired(
            selectedPaymentMethod?.paymentMethod.expMonth || 0,
            selectedPaymentMethod?.paymentMethod.expYear || 0
          );

          if(isOrderCoveredUnderVIFT && isCardExpiredFlag){
            isCardExpiredFlag = false;
          }

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
        error?.response?.data?.message || error?.message || getString("errorPlacingOrder") as string;
      updateOrderErrorMessage(errorMessage);
    }
  };

  const handlePaypalOrderRedirect = async (isRecurring: boolean) => {
    // @ts-ignore
    const data = JSON.parse(siteFlags[0].auxDataText);

    let ppClientId = GET_PAYPAL_CLIENT_ID();
    if (isIOSSafari()) { // add cache-busting parameter
      ppClientId += `&t=${Date.now()}`;
    }

    // loading paypal sdk
    loadScript({
      clientId: ppClientId, // Your PayPal Client ID
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
    const paypalRedirectUrl = isRecurring ? paypalRecurringUrl : `${GET_PAYPAL_CHECKOUT_URL()}?token=${paypalTokenId
      }`;

    return `${paypalRedirectUrl}&useraction=commit`;
  }

  const handleFinalPlaceOrderUpdate = () => {
    if (!order || isGuest) return;
    if (order) {
      return buildOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            trackingID: generateOrderTrackingId(trackingData),
          },
        }, pcid)
      );
    }
  };

  const handleFinalPlaceOrderUpdateWithoutPaymentMethods = () => {
    if (!order) return;
    if (order) {
      return buildOrder(
        generateChangeStoreResponse({
          ...order,
          paymentMethod: {},
          userOptions: {
            ...order.userOptions,
            trackingID: generateOrderTrackingId(trackingData),
          },
        }, pcid)
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

  useEffect(() => {
    if (paymentTypeId !== CLICK2PAY.typeId) return;
    handleClick2PayOrderUpdate();
  }, [paymentTypeId])

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
            const total = order ? order?.totals.price.toString() : "0";
            trackingData.set("transactionId", transId);
            trackingData.set("flowId", flowId);

            return getClickToPayTransactionData(flowId, transId, total);
          } else {
            console.error(`click2pay place order failed: ` + response ? response : `Click2pay checkoutActionCode not Complete`);
            const C2P_UNAVAILABLE_TRY_DIFFERENT_PAYMENT = `We're sorry, we have encountered an error with click2pay. Please try another payment method`
            throw new Error(C2P_UNAVAILABLE_TRY_DIFFERENT_PAYMENT);
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

          return isGuest ? walletData : addTempPaymentMethod(shopperId, walletData);
        })
        .then((response: any) => {

          if (order) {
            const updatedOrder = {
              ...order,
              billingAddress: c2pBillingAddress,
              userOptions: {
                ...order.userOptions,
                trackingID: generateOrderTrackingId(trackingData),
              },
            };

            if (isGuest) {
              updatedOrder.paymentMethod = {
                ...order.paymentMethod,
                accountName: response.accountName,
                number: response.number,
                token: response.token,
                typeID: response.typeID,
                expMonth: response.expMonth,
                expYear: response.expYear,
                type: response.type,
                categoryID: response.categoryID,
              };
            } else {
              updatedOrder.paymentMethod = {
                ...order.paymentMethod,
                id: response.id,
                accountName: response.accountName,
                number: response.number,
                token: response.token,
                typeID: response.typeID,
                expMonth: response.expMonth,
                expYear: response.expYear,
                type: response.type,
                categoryID: response.categoryID,
              };
            }
            return buildOrder(
              generateChangeStoreResponse(updatedOrder, pcid)
            );
          }
        })
        .then((response: any) => {
          setOrderData(response.response.success.data);
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
    const total = order ? order?.totals.price.toString() : "0";
    const tempOrderId = order ? order.userOptions?.tempOrderID : "0";
    const sezzleResponse = await fetchSezzleUrl(total, tempOrderId, isGuest);
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

  return (
    <div className="checkout-place-order margin-5">
      <Formik
        initialValues={{}}
        onSubmit={() => handlePlaceOrder(paymentMethods)}
      >
        {({ submitForm }) => {

          return (
            <form>
              {orderHasAutoshipItems(order || null) && (
                <div className="checkout-place-order-autoship checkout-place-order-text">
                  <div className="checkout-place-order-text__flex">
                  </div>
                  <div
                    className={`checkout-place-order-text__box`}
                  >
                    <div className="checkout-place-order-text">
                      {getString("autoShipAgreement")}
                    </div>
                  </div>
                </div>
              )}
              {/* <div className="checkout-place-order-text-terms-policy">
              {getString("agreeToTerms")}{" "}
              <a
                href="/info/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getString("termsOfUse")}
              </a>{" "}
              {getString("and")}{" "}
              <a
                href="/info/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getString("privacyPolicy")}
              </a>
              .
            </div> */}
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
                disabled={isLoading || isGuestEmailValid || (isCheckboxChecked && hasPhoneError)}
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
          );
        }}
      </Formik>
    </div>
  );
};

export default memo(PlaceOrder);