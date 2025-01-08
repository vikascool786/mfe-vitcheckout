import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import "../App.scss";
import { commitOrder, OrderResponse } from "../api/service/Order";
import { withErrorBoundary } from "../hoc/withErrorBoundary";
import { Checkout } from "./Checkout";
import { OrderSummary } from "../order-summary/OrderSummary";
import { PaymentMethod } from "../payment-method/PaymentMethods";
import { ShippingMethod } from "../shipping-methods/ShippingMethod";
import { useApi } from "../hooks/useAPI";
import { Address } from "../interfaces/Address";
import { ChangeOrder } from "../interfaces/ChangeOrder";
import { Order } from "../interfaces/Order";
import { IPaymentMethod } from "../interfaces/PaymentMethod";
import { orderAtom } from "../store";

import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import HeadHelmet from "../head-helmet/HeadHelmet";
import PlaceOrder from "../payment-method/place-order/PlaceOrder";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
} from "../utils/urlResolver";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

const getInitialBuildOrderData = (cartId: string): ChangeOrder => ({
  debug: true,
  id: cartId,
  customer_id: "",
  ufo_id: "",
  shipping_country: "USA",
  product_country: "USA",
  language: "ENG",
  site_type: "W",
  application: "cart",
  userOptions: {
    applyCashback: false,
    applyEWallet: false,
    isOfAge: false,
    trackingID: "",
    deliveryDate: "",
    deliveryTime: 1234567890,
    signatureRequired: false,
    oosConsolidate: false,
    userSessionId: "",
    coupons: [],
  },
});

interface ICheckoutContainer {
  shopperId: string;
  cartId: string;
  pcid: string;
  siteId: string;
}

const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
  pcid,
  siteId,
}) => {
  const [orderData, setOrderData] = useAtom(orderAtom);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  // const orderData = ORDER_DATA;
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder

  const addressUrl = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${apiKey}`;
  const paymentUrl = `${apiDomain}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${apiKey}`;
  const checkoutUrl = `${apiDomain}/checkout-universal/v1/checkouts?api_key=${apiKey}`;

  const {
    data: addresses,
    isLoading: loadingAddresses,
    error: addressError,
  } = useApi<Address[]>(addressUrl, "GET");

  const {
    data: paymentMethods,
    isLoading: loadingPaymentMethods,
    error: paymentError,
  } = useApi<IPaymentMethod[]>(paymentUrl, "GET");

  const {
    data: order,
    isLoading: loadingOrder,
    postData,
  } = useApi<OrderResponse>(
    checkoutUrl,
    "POST",
    getInitialBuildOrderData(cartId)
  );

  const updateOrder = async (
    orderData: Order,
    billingId: number,
    shippingId: number
  ) => {
    const orderResponse = await postData(
      generateChangeStoreResponse({
        ...orderData,
        billingAddress: { ...orderData.billingAddress, id: billingId },
        shippingAddress: { ...orderData.shippingAddress, id: shippingId },
      })
    );
    setOrderData(orderResponse?.response.success.data);
  };

  const defaultAddress = useMemo(
    () => addresses?.find((address) => address.isPrimary === 1),
    [addresses]
  );

  const defaultPaymentMethod = useMemo(
    () => paymentMethods?.find((payment) => payment.preferred),
    [paymentMethods]
  );

  const confirmOrder = () => {
    const commitPromise = commitOrder(cartId);
    commitPromise
      .then((response: any) => {
        const isSuccessful = response.data.response.success;
        if (isSuccessful) {
          const orderId = response.data.response.success.data.orderId;
          window.location.href = `/nbts/orderconfirmation-${orderId}`;
        } else {
          const errorMessage = response.data.response.errors.message;
          const errorCode = response.data.response.errors.code;
          setOrderErrorMessage(
            "Detail: " + errorMessage + " code: " + errorCode
          );
        }
      })
      .catch((error: { message: any }) => {
        setOrderErrorMessage("Detail: " + error);
      });
  };

  useEffect(() => {
    if (
      !hasInitializedOrder.current &&
      defaultAddress &&
      defaultPaymentMethod &&
      order?.response.success.data
    ) {
      hasInitializedOrder.current = true; // Mark as initialized
      updateOrder(
        order?.response.success.data,
        defaultPaymentMethod.addressId,
        defaultAddress.id
      );
    }
  }, [defaultAddress, defaultPaymentMethod, order?.response.success.data]);

  if (loadingAddresses || loadingPaymentMethods || loadingOrder)
    return <div>Loading...</div>;

  if (addressError || paymentError) return <div>Failed to load data</div>;

  return (
    <div className="checkout-container">
      {orderData && (
        <>
          <div className="left-column">
            <Checkout
              shopperId={shopperId}
              cartId={cartId}
              addresses={addresses}
            />
            <ShippingMethod order={orderData} />
            <PaymentMethod
              cartId={cartId}
              shopperId={shopperId}
              siteId={siteId}
              pcid={pcid}
              updatePaymentTypeId={setPaymentTypeId}
            />
          </div>
          <div className="right-column">
            <OrderSummary pcid={pcid} />
          </div>
        </>
      )}
      <div className="place-order">
        <PlaceOrder
          confirmOrder={confirmOrder}
          errorMessage={orderErrorMessage}
          paymentTypeId={paymentTypeId}
          shopperId={shopperId}
          siteId={siteId}
          order={orderData}
        />
      </div>
      <HeadHelmet />
    </div>
  );
};

export default withErrorBoundary(CheckoutContainer);
