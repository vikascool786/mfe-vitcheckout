import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../App.scss";
import { createAutoshipUrl } from "../api/ajaxaction/Autoship";
import { checkoutSezzle } from "../api/ajaxaction/Sezzle";
import { buildOrder, commitOrder, OrderResponse } from "../api/service/Order";
import ErrorMessage from "../component/Error";
import { Spinner } from "../component/Spinner/Spinner";
import HeadHelmet from "../head-helmet/HeadHelmet";
import { withErrorBoundary } from "../hoc/withErrorBoundary";
import { useApi } from "../hooks/useAPI";
import { Address } from "../interfaces/Address";
import { ChangeOrder } from "../interfaces/ChangeOrder";
import { Order } from "../interfaces/Order";
import { IPaymentMethod } from "../interfaces/PaymentMethod";
import { OrderSummary } from "../order-summary/OrderSummary";
import PaymentMethod from "../payment-method/PaymentMethods";
import PlaceOrder from "../payment-method/place-order/PlaceOrder";
import ShippingMethod from "../shipping-methods/ShippingMethod";
import {
  loadingAtom,
  orderAtom,
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../store";
import { getOrderNotifications } from "../utils/OrderUtils";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { handleSezzleCheckout } from "../utils/helpers/SezzleHelper";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
  GET_SHOP_CART_URL,
} from "../utils/urlResolver";
import Feedback from "./../Feedback/Feedback";
import Checkout from "./Checkout";
import { Notifications } from "./Notifications";
import SessionTimeout from "./SessionTimeout";
import { portalApiData } from "./portalAtom";
import Skeleton from "../component/Skeleton/Skeleton";
import { setDataObjectProperty } from "../utils/helpers/SetDataObjectProperty";
import { ADDRESS_BOOK, PORTAL_DATA, WALLET_DATA } from "../utils/MOCKS";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

const getInitialBuildOrderData = (
  cartId: string,
  portalId: string
): ChangeOrder => ({
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
    portalId: portalId || "",
  },
});

interface ICheckoutContainer {
  shopperId: string;
  cartId: string;
  pcid: string;
  siteId: string;
  sessionId: string;
}

const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
  pcid,
  siteId,
  sessionId,
}) => {
  const [orderData, setOrderData] = useAtom(orderAtom);

  const [showEmptyOrder, setShowEmptyOrder] = useState(false);
  const [isLoading] = useAtom(loadingAtom);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder
  const [loadingOrderConfirmation, setLoadingOrderConfirmation] =
    useState(false);
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );

  // const paymentMethodOptions = useAtomValue(paymentMethodsAtom);
  const portalData = PORTAL_DATA;

  const addressUrl = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?siteId=${siteId}&api_key=${apiKey}`;
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

  useEffect(() => {
    setDataObjectProperty("pageName", "singlePage");
    setDataObjectProperty("pageType", "checkout");
  }, []);

  // const {
  //   data: addresses = [],
  //   isLoading: loadingAddresses,
  //   error: addressError,
  // } = useApi<Address[] | null>(addressUrl, "GET");

  // const {
  //   data: paymentMethods = [],
  //   isLoading: loadingPaymentMethods,
  //   error: paymentError,
  // } = useApi<IPaymentMethod[] | null>(paymentUrl, "GET");

  // const {
  //   data: order,
  //   isLoading: loadingOrder,
  //   postData,
  //   error: orderError,
  //   isComplete: isFetchOrderComplete,
  // } = useApi<OrderResponse>(fetchOrderUrl, "GET");

  const addresses = ADDRESS_BOOK;

  const paymentMethods = WALLET_DATA;

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
    setOrderNotifications(
      getOrderNotifications(orderResponse?.response.success)
    );
  };

  const defaultAddress = useMemo(() => {
    const filteredAddresses = addresses?.filter((ad) => ad.hasAddress !== 0);
    return (
      filteredAddresses?.find((address) => address?.isShip === 1) ??
      filteredAddresses?.find((address) => address?.isPrimary === 1) ??
      filteredAddresses?.[0]
    );
  }, [addresses]);

  const defaultPaymentMethod: IPaymentMethod = useMemo<IPaymentMethod>(
    () =>
      paymentMethods
        ? (paymentMethods?.find(
            (payment) => payment?.preferred
          ) as IPaymentMethod)
        : ({} as IPaymentMethod),
    [paymentMethods]
  );

  const orderHasNewAutoship = (): boolean => {
    if (orderData) {
      const newAutoshipItems = Object.values(orderData.stores)
        .flatMap((store) => store.items)
        .filter((item) => item.autoshipFreq > 0);
      return newAutoshipItems.length > 0;
    }
    return false;
  };

  const confirmOrder = () => {
    commitOrder(cartId)
      .then((response: any) => {
        setLoadingOrderConfirmation(false);
        const isSuccessful = response?.data?.response?.success;
        if (isSuccessful) {
          const orderId = response.data.response.success.data.orderId;
          //if order needs a new autoship created
          if (orderHasNewAutoship()) {
            createAutoshipUrl(shopperId, orderId)
              .then((response: any) => {
                redirectToOrderConfirmation(orderId);
              })
              .catch((error) => {
                console.error(`Error creating autoship from order: ${error}`);
                redirectToOrderConfirmation(orderId);
              });
          } else {
            redirectToOrderConfirmation(orderId);
          }
        } else {
          if (response?.data?.response?.errors[0]?.message) {
            setOrderErrorMessage(response?.data?.response?.errors[0]?.message);
            return;
          }

          const errorMessage = response.data.response.errors.message;
          const errorCode = response.data.response.errors.code;
          const developerMessage =
            response.data.response.errors.developer_message;
          setOrderErrorMessage(
            `Detail: ${errorMessage} ${developerMessage} (code: ${errorCode})`
          );
        }
      })
      .catch((error) => {
        setOrderErrorMessage(error);
        setLoadingOrderConfirmation(false);
      });
  };

  const redirectToOrderConfirmation = (orderId: string | number): void => {
    window.location.href = `/nbts/orderconfirmation-${orderId}`;
  };

  // useEffect(() => {
  //   if (isFetchOrderComplete) {
  //     if (!order) {
  //       let buildOrderPayload = getInitialBuildOrderData(
  //         cartId,
  //         portalData?.portalId
  //       );
  //       if (defaultAddress?.id) {
  //         buildOrderPayload.shipping = buildOrderPayload.shipping ?? { id: 0 };
  //         buildOrderPayload.shipping.id = defaultAddress.id;
  //       }
  //       if (defaultPaymentMethod?.addressId) {
  //         buildOrderPayload.billing = buildOrderPayload.billing ?? { id: 0 };
  //         buildOrderPayload.billing.id = defaultPaymentMethod.addressId;
  //       }

  //       const orderResponse = buildOrder(buildOrderPayload);
  //       orderResponse.then((response) => {
  //         if (
  //           response.response?.errors?.message ===
  //           "There are no items in your cart."
  //         ) {
  //           window.location.href = GET_SHOP_CART_URL();
  //         }
  //         setOrderData(response?.response.success?.data || null);
  //         setOrderNotifications(
  //           getOrderNotifications(response?.response.success)
  //         );
  //       });
  //     } else {
  //       if (!order.response.success.data) return;
  //       const orderResponse = order.response.success.data;
  //       if (!orderResponse.billingAddress.id) {
  //         orderResponse.billingAddress.id =
  //           defaultPaymentMethod?.addressId || defaultAddress?.id;
  //       }
  //       if (!orderResponse.shippingAddress.id) {
  //         orderResponse.shippingAddress.id = defaultAddress?.id;
  //       }

  //       setOrderData(orderResponse);
  //       setOrderNotifications(getOrderNotifications(order.response.success));
  //     }
  //   }
  // }, [isFetchOrderComplete, defaultAddress, defaultPaymentMethod]);

  // useEffect(() => {
  //   const currentOrderData = order ? order.response.success.data : orderData;

  //   setOrderData(currentOrderData);

  //   if (!hasInitializedOrder.current && currentOrderData && !order) {
  //     hasInitializedOrder.current = true;
  //     updateOrder(
  //       currentOrderData,
  //       defaultPaymentMethod?.addressId ?? defaultAddress?.id ?? 0,
  //       defaultAddress?.id ?? 0
  //     );
  //   }
  // }, [defaultAddress, defaultPaymentMethod]);

  const handlePlaceOrderUpdate = (value: boolean) => {
    setLoadingOrderConfirmation(value);
  };

  const handleUpdateOrderErrorMessage = (message: string) => {
    setOrderErrorMessage(message);
  };

  // if (loadingAddresses || loadingPaymentMethods || loadingOrder)
  //   return <Skeleton />;

  // if (addressError || paymentError) return <div>Failed to load data</div>;

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
                <Notifications
                  notificationMessages={orderNotifications || []}
                />
                <Checkout
                  shopperId={shopperId}
                  siteId={siteId}
                  addresses={addresses || []}
                  loading={isLoading}
                  pcid={pcid}
                />
                <ShippingMethod loading={isLoading} shopperID={shopperId} />
                {orderData.totals.price > 0 && (
                  <PaymentMethod
                    cartId={cartId}
                    shopperId={shopperId}
                    siteId={siteId}
                    pcid={pcid}
                    updatePaymentTypeId={setPaymentTypeId}
                    loading={isLoading}
                  />
                )}
              </div>
              <div className="right-column">
                <OrderSummary pcid={pcid} shopperId={shopperId} />
              </div>
            </div>
            {/* <div className="place-order">
              {paymentMethodOptions && (
                <PlaceOrder
                  confirmOrder={confirmOrder}
                  errorMessage={orderErrorMessage}
                  paymentTypeId={paymentTypeId}
                  paymentMethods={paymentMethodOptions}
                  shopperId={shopperId}
                  siteId={siteId}
                  order={orderData}
                  updateOrderErrorMessage={handleUpdateOrderErrorMessage}
                  billingId={defaultAddress?.id || 0}
                  setOrderData={setOrderData}
                  shippingId={
                    defaultPaymentMethod?.addressId ?? defaultAddress?.id ?? 0
                  }
                />
              )}
              <Feedback siteId={siteId} pcId={pcid} sessionId={sessionId} />
            </div> */}
            <HeadHelmet />
            <SessionTimeout />
          </div>
        </>
      )}

      {/* {orderData?.response.errors && (
        <ErrorMessage
          errorMessage={
            order?.response.errors && order?.response.errors.message
          }
        />
      )} */}
    </div>
  );
};

export default withErrorBoundary(
  CheckoutContainer,
  <div>An unexpected error occurred. Please try again later.</div>
);
