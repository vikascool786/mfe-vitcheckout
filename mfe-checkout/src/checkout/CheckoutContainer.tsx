import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../App.scss";
import { buildOrder, commitOrder, OrderResponse } from "../api/service/Order";
import { withErrorBoundary } from "../hoc/withErrorBoundary";
import { useApi } from "../hooks/useAPI";
import { Address } from "../interfaces/Address";
import { ChangeOrder } from "../interfaces/ChangeOrder";
import { Order } from "../interfaces/Order";
import { IPaymentMethod } from "../interfaces/PaymentMethod";
import { OrderSummary } from "../order-summary/OrderSummary";
import PaymentMethod from "../payment-method/PaymentMethods";
import ShippingMethod from "../shipping-methods/ShippingMethod";
import { loadingAtom, orderAtom } from "../store";
import Checkout from "./Checkout";
import Swal from "sweetalert2";
import HeadHelmet from "../head-helmet/HeadHelmet";
import PlaceOrder from "../payment-method/place-order/PlaceOrder";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
} from "../utils/urlResolver";
import ErrorMessage from "../component/Error";
import { checkoutSezzle } from "../api/ajaxaction/Sezzle";
import { handleSezzleCheckout } from "../utils/helpers/SezzleHelper";
import { Spinner } from "../component/Spinner/Spinner";
import { number } from "yup";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

const getInitialBuildOrderData = (
  cartId: string
): ChangeOrder => ({
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
    oosConsolidate: 3,
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
  const [isLoading] = useAtom(loadingAtom);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder
  const [loadingOrderConfirmation, setLoadingOrderConfirmation] =
    useState(false);

  const addressUrl = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${apiKey}`;
  const paymentUrl = `${apiDomain}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${apiKey}`;
  const checkoutUrl = `${apiDomain}/checkout-universal/v1/checkouts?api_key=${apiKey}`;
  const fetchOrderUrl = `${apiDomain}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${apiKey}`;

  useEffect(() => {
    handleSezzleCheckout(
      location.search,
      checkoutSezzle,
      buildOrder,
      generateChangeStoreResponse,
      setLoadingOrderConfirmation,
      confirmOrder,
      cartId
    );
  }, [location.search]);

  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    error: addressError,
  } = useApi<Address[] | null>(addressUrl, "GET");

  const {
    data: paymentMethods = [],
    isLoading: loadingPaymentMethods,
    error: paymentError,
  } = useApi<IPaymentMethod[] | null>(paymentUrl, "GET");

  const {
    data: order,
    isLoading: loadingOrder,
    postData,
    error: orderError,
    isComplete: isFetchOrderComplete,
  } = useApi<OrderResponse>(fetchOrderUrl, "GET");

  const updateOrder = async (
    orderData: Order,
    billingId: number,
    shippingId: number
  ) => {
    const orderResponse = await buildOrder(
      generateChangeStoreResponse({
        ...orderData,
        billingAddress: { ...orderData.billingAddress, id: billingId },
        shippingAddress: { ...orderData.shippingAddress, id: shippingId },
      })
    );
    setOrderData(orderResponse?.response.success?.data || null);
  };

  const defaultAddress = useMemo(
    () => {
      const filteredAddresses = addresses?.filter((ad) => ad.hasAddress !== 0);
      return (
          filteredAddresses?.find((address) => address?.isShip === 1) ??
          filteredAddresses?.find((address) => address?.isPrimary === 1) ??
          filteredAddresses?.[0]
      );
    },
    [addresses]
  );

  const defaultPaymentMethod: IPaymentMethod = useMemo<IPaymentMethod>(
    () =>
      paymentMethods
        ? (paymentMethods?.find(
            (payment) => payment?.preferred
          ) as IPaymentMethod)
        : ({} as IPaymentMethod),
    [paymentMethods]
  );

  const confirmOrder = () => {
    commitOrder(cartId)
      .then((response: any) => {
        setLoadingOrderConfirmation(false);
        const isSuccessful = response?.data?.response?.success;
        if (isSuccessful) {
          const orderId = response.data.response.success.data.orderId;
          window.location.href = `/nbts/orderconfirmation-${orderId}`;
        } else {
          const errorMessage = response.data.response.errors.message;
          const errorCode = response.data.response.errors.code;
          setOrderErrorMessage(`Detail: ${errorMessage} code: ${errorCode}`);
        }
      })
      .catch((error) => {
        setLoadingOrderConfirmation(false);
        setOrderErrorMessage(`Detail: ${error?.message || error}`);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error?.message,
        });
      });
  };

  useEffect(() => {
    if (isFetchOrderComplete) {
      if (!order) {
        let buildOrderPayload = getInitialBuildOrderData(cartId);
        if(defaultAddress?.id){
          buildOrderPayload.shipping = buildOrderPayload.shipping ?? {id:0};
          buildOrderPayload.shipping.id = defaultAddress.id;
        }
        if(defaultPaymentMethod?.addressId){
          buildOrderPayload.billing = buildOrderPayload.billing ?? {id:0};
          buildOrderPayload.billing.id = defaultPaymentMethod.addressId;
        }

        const orderResponse = buildOrder(
            buildOrderPayload
        );
        orderResponse.then((response: any) => {
          setOrderData(response?.response.success?.data || null);
        });
      }
    }
  }, [isFetchOrderComplete, defaultAddress, defaultPaymentMethod]);

  useEffect(() => {
    const currentOrderData = order ? order.response.success.data : orderData;
    setOrderData(currentOrderData);
    if (!hasInitializedOrder.current && currentOrderData && !order) {
      hasInitializedOrder.current = true;
      updateOrder(
        currentOrderData,
          defaultPaymentMethod?.addressId ?? defaultAddress?.id ?? 0,
          defaultAddress?.id ?? 0
      );
    }
  }, [defaultAddress, defaultPaymentMethod, order, orderData]);

  const handlePlaceOrderUpdate = (value: boolean) => {
    setLoadingOrderConfirmation(value);
  };

  const handleUpdateOrderErrorMessage = (message: string) => {
    setOrderErrorMessage(message);
  };

  if (loadingAddresses || loadingPaymentMethods || loadingOrder)
    return <div>Loading...</div>;

  if (addressError || paymentError) return <div>Failed to load data</div>;

  if (loadingOrderConfirmation)
    return (
      <div className="loading-order-conf">
        <div>Please wait while your order is being placed</div>
        <Spinner />
      </div>
    );

  return (
    <div>
      {orderData && (
        <>
          <div className="container">
            <div className="checkout-container">
              <div className="left-column">
                <Checkout
                  shopperId={shopperId}
                  siteId={siteId}
                  addresses={addresses || []}
                  loading={isLoading}
                />
                <ShippingMethod loading={isLoading} />
                <PaymentMethod
                  cartId={cartId}
                  shopperId={shopperId}
                  siteId={siteId}
                  pcid={pcid}
                  updatePaymentTypeId={setPaymentTypeId}
                  loading={isLoading}
                />
              </div>
              <div className="right-column">
                <OrderSummary pcid={pcid} />
              </div>
            </div>
            <div className="place-order">
              <PlaceOrder
                confirmOrder={confirmOrder}
                errorMessage={orderErrorMessage}
                paymentTypeId={paymentTypeId}
                shopperId={shopperId}
                siteId={siteId}
                order={orderData}
                updateOrderErrorMessage={handleUpdateOrderErrorMessage}
                billingId={defaultAddress?.id || 0}
                shippingId={
                  defaultPaymentMethod?.addressId ?? defaultAddress?.id ?? 0
                }
              />
            </div>
            <HeadHelmet />
          </div>
        </>
      )}

      {order?.response.errors && (
        <ErrorMessage
          errorMessage={
            order?.response.errors && order?.response.errors.message
          }
        />
      )}
    </div>
  );
};

export default withErrorBoundary(CheckoutContainer);
