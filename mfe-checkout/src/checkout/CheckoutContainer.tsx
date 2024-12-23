import React, { useEffect, useMemo, useRef } from "react";
import { Provider, useSetAtom, useAtom } from "jotai";
import "../App.scss";
import { changeOrder, fetchOrderDetail, OrderResponse } from "../api/service/Order";
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
import { orderAtom, OrderStore } from "../store";
import { ORDER_DATA } from "../utils/MOCKS";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../utils/ApiConstants";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import HeadHelmet from "../head-helmet/HeadHelmet";


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
    trackingId: "",
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
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder

  const addressUrl = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${API_KEY}`;
  const paymentUrl = `${GET_API_ENDPOINT_BASE_URL}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${API_KEY}`;
  const checkoutUrl = `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts?api_key=${API_KEY}`;

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
  } = useApi<OrderResponse>(checkoutUrl, "POST", getInitialBuildOrderData(cartId));

  const updateOrder = async (
    orderData: Order,
    paymentId: number,
    billingId: number,
    shippingId: number
  ) => {
    const orderResponse = await postData(
      generateChangeStoreResponse({
        ...orderData,
        paymentMethod: { ...orderData.paymentMethod, id: paymentId },
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
        defaultPaymentMethod.id,
        defaultPaymentMethod.addressId,
        defaultAddress.id
      );
    }
  }, [defaultAddress, defaultPaymentMethod, order?.response.success.data]);

  if (loadingAddresses || loadingPaymentMethods || loadingOrder)
    return <div>Loading...</div>;

  if (addressError || paymentError)
    return <div>Failed to load data</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        {orderData && (
          <>
            <Checkout
              shopperId={shopperId}
              cartId={cartId}
              addresses={addresses}
            />
            <ShippingMethod order={orderData} />
            <PaymentMethod cartId={cartId} shopperId={shopperId} siteId={siteId} pcid={pcid} />
          </>
        )}
      </div>
      <div>
        <OrderSummary pcid={pcid} />
      </div>
      <HeadHelmet />
    </div>
  );
};

export default withErrorBoundary(CheckoutContainer);