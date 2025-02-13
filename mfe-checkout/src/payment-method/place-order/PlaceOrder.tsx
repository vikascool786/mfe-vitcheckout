import React, { memo, useEffect, useState } from "react";
import "./PlaceOrder.scss";
import { Button } from "../../component/Button/Button";
import { CLICK2PAY, PAYPAL, SEZZLE } from "../PaymentType";
import { getTransactionData } from "../../api/service/Click2PayTransaction";
import Click2PayPlaceOrder from "../../payment-method-click2pay/Click2PayPlaceOrder";
import {
  addTempPaymentMethod,
  generatePayPalTransactionDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { loadScript } from "@paypal/paypal-js";
import { buildOrder, changeOrder } from "../../api/service/Order";
import { fetchSiteFlagData } from "../../api/service/SiteFlags";
import { useApi } from "../../hooks/useAPI";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
  GET_PAYPAL_CLIENT_ID,
  GET_PAYPAL_RETURN_URL,
} from "../../utils/urlResolver";
import { Order } from "../../interfaces/Order";
import { generateOrderTrackingId } from "../../utils/helpers/GenerateOrderTrackingId";
import { Address } from "../../interfaces/Address";
import { useAtom, useAtomValue } from "jotai/index";
import { siteApiData } from "../../checkout/siteAtom";
import { fetchSezzleUrl } from "../../api/ajaxaction/Sezzle";
import { orderAtom, paymentMethodsAtom } from "../../store";
import { Checkbox } from "../../component/Form/Checkbox/Checkbox";
import { Formik } from "formik";
import { placeOrderSchema } from "../../validation/placeOrderSchema";
import {
  getOrderConsolidateData,
  orderHasAutoshipItems,
} from "../../utils/OrderUtils";
import { OrderConsolidationData } from "../../interfaces/OrderConsolidationData";

interface IPlaceOrder {
  confirmOrder: () => void;
  billingId: number;
  shippingId: number;
  errorMessage: string;
  paymentTypeId: number;
  shopperId: string;
  siteId: string;
  order?: Order;
  updateOrderErrorMessage: (newMessage: string) => void;
}

const PAYPAL_TOKEN_URL = (shopperId: string, totalAmountDue: number) =>
  // make the return url and cancel url dynamic
  // TODO: PICK THIS UP FROM ENVIORNMENT VARIABLES
  `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/Paypal/${shopperId}/Token?creditFlow=false&hideShipping=false&markFlow=false&returnURL=${GET_PAYPAL_RETURN_URL()}&cancelURL=${GET_PAYPAL_RETURN_URL()}&api_key=${GET_API_KEY()}&total=${totalAmountDue}`;

const PlaceOrder: React.FC<IPlaceOrder> = ({
  confirmOrder,
  errorMessage,
  paymentTypeId,
  shopperId,
  siteId,
  order,
  updateOrderErrorMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const trackingData = new Map<string, string>();
  const [siteData] = useAtom(siteApiData(siteId));

  const [orderData, setOrderData] = useAtom(orderAtom);

  const paymentMethods = useAtomValue(paymentMethodsAtom);

  const selectedPaymentMethod = paymentMethods.find((pm) => pm.isSelected);

  const [orderConsolidateData, setOrderConsolidateData] =
    useState<OrderConsolidationData>(getOrderConsolidateData(order || null));

  useEffect(() => {
    if (order) {
      setOrderConsolidateData(getOrderConsolidateData(order));
    }
  }, [order]);

  const { data: paypalToken } = useApi<{ tokenId: string }>(
    PAYPAL_TOKEN_URL(shopperId, order?.totals.price || 0),
    "GET"
  );

  const handlePlaceOrder = async () => {
    const selectedPaymentMethod = paymentMethods.find((pm) => pm.isSelected);

    if (!selectedPaymentMethod?.isPaymentValidated && orderData) {
      setOrderData({
        ...orderData,
        isOrderValidForNotValidPlacing: true,
      });
      return;
    }
    const getQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      return {
        token: params.get("token"),
        payerId: params.get("PayerID"),
      };
    };

    const { token, payerId } = getQueryParams();

    const isPaypalOrderSuccess = token && payerId;

    if (isPaypalOrderSuccess) {
      const response = await generatePayPalTransactionDetails(
        shopperId,
        token,
        true,
        false
      );
      if (order) {
        const changeOrderDetails = generateChangeStoreResponse(order);

        delete response.paymentMethod["id"];

        changeOrder(
          {
            ...changeOrderDetails,
            paymentMethod: {
              ...response.paymentMethod,
            },
            userOptions: {
              ...changeOrderDetails.userOptions,
              trackingID: `paypal%3D${response.callID}`,
            },
          },
          order?.id
        ).then(() => {
          confirmOrder();
        });
      }

      return;
    }

    try {
      setIsLoading(true);
      paymentTypeId =
        selectedPaymentMethod?.paymentMethod.typeID || paymentTypeId;

      switch (paymentTypeId) {
        case CLICK2PAY.typeId:
          await handleClick2PayOrderUpdate();
          confirmOrder();
          break;
        case SEZZLE.typeId:
          console.log("place order with Sezzle");
          await handleSezzleOrder();
          break;
        case PAYPAL.typeId:
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

          if (!paypalToken) {
            alert("Failed to fetch PayPal token, check console for message");
            // console.log(error);
            return;
          }
          const url = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalToken.tokenId}`;
          window.open(url, "_self");
          break;
        default:
          await handleFinalPlaceOrderUpdate();
          confirmOrder();
          break;
      }
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
      let errMsg = "Error connecting with Sezzle";
      if (typeof sezzleResponse.error != "undefined") {
        errMsg = sezzleResponse.error;
      }
      updateOrderErrorMessage(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <div className="checkout-place-order">
      <Formik
        initialValues={{ autoshipTerms: !orderHasAutoshipItems(order || null) }}
        validationSchema={placeOrderSchema}
        onSubmit={(values) => {
          handlePlaceOrder();
        }}
      >
        {({
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
          submitForm,
          values,
        }) => (
          <form>
            {orderHasAutoshipItems(order || null) && (
              <div className="checkout-place-order-autoship checkout-place-order-text">
                <div className="checkout-place-order-text__heading">
                  Autoship Terms and Conditions
                </div>
                <div className="checkout-place-order-text">
                  When submitting your AutoShip along with providing payment and
                  a shipping address, you authorize us to charge the same
                  selected payment method each time your AutoShip order is
                  processed. This is for your initial AutoShip order and
                  subsequent AutoShip orders until you cancel your AutoShip.
                  There is no obligation and you may cancel at any time. After
                  you cancel, you will not be billed for, or receive, any future
                  automatic shipments.
                </div>
                <div className="checkout-place-order-text__note">
                  Please note that at the time of your order pulling, the
                  shipping, tax and/or fee cost could change or be adjusted
                  based on current rates and the availability of the products
                  being shipped.
                </div>
                <Checkbox
                  name="autoshipTerms"
                  title="I agree to the Autoship Terms & Conditions"
                  onChange={() =>
                    setFieldValue("autoshipTerms", !values.autoshipTerms)
                  }
                  errorMessage={touched.autoshipTerms && errors.autoshipTerms}
                />
              </div>
            )}
            <div className="checkout-place-order-text">
              By clicking place order, you agree to the SHOP.COM{" "}
              <a href="/info/terms-of-use">Terms of Use</a> and
              <a href="/info/privacy-policy">Privacy Policy</a>.
            </div>
            {errorMessage.length > 0 && (
              <div className="error-msg error-msg--padding">
                <div className="error-msg--bold">
                  There was an issue placing your order
                </div>
                <div className="error-msg__detail">{errorMessage}</div>
              </div>
            )}
            {orderConsolidateData.oosConsolidate === 2 && (
              <div className="alert-message">
                You will be charged when product(s) are available for shipment
              </div>
            )}
            {isLoading ? (
              <div>Processing Order...</div>
            ) : (
              <Button
                label={
                  paymentTypeId === SEZZLE.typeId ||
                    paymentTypeId === PAYPAL.typeId
                    ? "Pay with"
                    : "Place Order"
                }
                btnType="primary"
                onClick={submitForm}
                logo={
                  paymentTypeId === SEZZLE.typeId
                    ? "https://img.shop.com/Image/resources/checkout/Sezzle-Color-White-Logo.svg"
                    : paymentTypeId === PAYPAL.typeId
                      ? "https://img.shop.com/Image/resources/checkout/PayPal-White-Logo.svg"
                      : ""
                }
              />
            )}
          </form>
        )}
      </Formik>
    </div>
  );
};

export default memo(PlaceOrder);
