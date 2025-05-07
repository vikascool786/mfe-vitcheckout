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
  addressAtom,
  loadingAtom,
  orderAtom,
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../store";
import {
  getOrderNotifications,
  orderHasAutoshipItems,
} from "../utils/OrderUtils";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {handleSezzleCheckout, isSezzleSelectedPayment, isSezzleSuccessful} from "../utils/helpers/SezzleHelper";
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
import PaymentMethodHeading from "../payment-method/PaymentMethodHeading";
import { TextUpdates } from "../text-updates/TextUpdates";
import { GET_API_MODE } from "../utils/helpers/urlResolvers";
import { getShippingAddressFromAddressList } from "../utils/AddressUtils";
import {CreditCardFormProvider} from "../component/Form/CreditCardFormContext";
import {siteApiData} from "./siteAtom";
import { isSuccessfulPaypalCallback } from "../utils/helpers/PaypalHelper";
import ShippingMethodHeading from "../shipping-methods/ShippingMethodHeading";
import { getUserAgent } from "../utils/helpers/UserSessionDataHelper";

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
    applyEWallet: false,
    isOfAge: false,
    trackingID: "",
    deliveryDate: "",
    signatureRequired: false,
    oosConsolidate: 3,
    userSessionID: "",
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
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const apiMode = GET_API_MODE();

  const [isAutoShipChecked, setIsAutoShipChecked] = useState<boolean>(false);
  const addressList = useAtomValue(addressAtom);
  const paymentMethodOptions = useAtomValue(paymentMethodsAtom);
  const [portalData] = useAtom(portalApiData(shopperId));
  const memorizedSiteId = useMemo(() => siteId, [siteId]);
  const [siteData] = useAtom(siteApiData(memorizedSiteId));
  const [hasPhoneError, setHasPhoneError] = useState<boolean>(false);
  const [mobileRequiredMessage, setMobileRequiredMessage] =
    useState<boolean>(false);
  const isAddressSaved = useMemo(
    () => addressList?.some((address) => address.hasAddress === 1),
    [addressList]
  );

  const [isPlacingOrderWithThirdParty, setIsPlacingOrderWithThirdParty] = useState<boolean>(false);

  const addressUrl = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?siteId=${siteId}&api_key=${apiKey}`;
  const paymentUrl = `${apiDomain}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${apiKey}`;
  const checkoutUrl = `${apiDomain}/checkout-universal/v1/checkouts?api_key=${apiKey}`;
  const fetchOrderUrl = `${apiDomain}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${apiKey}`;

  useEffect(() => {
    if(isSezzleSelectedPayment(location.search)){
      const isSuccessfulSezzleCallback = isSezzleSuccessful(location.search);
      setIsPlacingOrderWithThirdParty(isSuccessfulSezzleCallback);
      setIsLoading(isSuccessfulSezzleCallback);
      handleSezzleCheckout(
          location.search,
          checkoutSezzle,
          buildOrder,
          generateChangeStoreResponse,
          setIsLoading,
          confirmOrder,
          cartId
      );
    } else if(isSuccessfulPaypalCallback(location.search)){
      setIsPlacingOrderWithThirdParty(true);
      setIsLoading(true);
    }
  }, [location.search]);

  useEffect(() => {
    setDataObjectProperty("pageName", "singlePage");
    setDataObjectProperty("pageType", "checkout");
  }, []);

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

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

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
    if (addresses) {
      return getShippingAddressFromAddressList(addresses, siteData.siteCountryCode);
    }
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

  const getProcessedOrders = (): string[] => {
    return JSON.parse(localStorage.getItem("processedOrders") || "[]");
  };

  const setProcessedOrders = (orders: string[]) => {
    localStorage.setItem("processedOrders", JSON.stringify(orders));
  };

  const confirmOrder = () => {
    let processedOrders = getProcessedOrders();

    // Prevent duplicate processing for the same cartId
    if (processedOrders.includes(cartId)) {
      console.warn(`Order already processed for cartId: ${cartId}`);
      return;
    }
    processedOrders.push(cartId);
    setProcessedOrders(processedOrders);

    commitOrder(cartId)
      .then((response: any) => {
        const isSuccessful = response?.data?.response?.success;
        if (isSuccessful) {
          const orderId = response?.data?.response?.success?.data.orderId;

          // Remove cartId from tracking since order is successful
          processedOrders = getProcessedOrders().filter((id) => id !== cartId);
          setProcessedOrders(processedOrders);

          if (orderHasNewAutoship()) {
            createAutoshipUrl(shopperId, orderId)
              .then(() => redirectToOrderConfirmation(orderId))
              .catch((error) => {
                console.error(`Error creating autoship from order: ${error}`);
                redirectToOrderConfirmation(orderId);
              });
          } else {
            redirectToOrderConfirmation(orderId);
          }
        } else {
          handleOrderError(response);
        }
      })
      .catch((error) => {
        handleOrderError(error);
      });
  };

  const handleOrderError = (error: any) => {
    let processedOrders = getProcessedOrders().filter((id) => id !== cartId);
    setProcessedOrders(processedOrders);

    if (error?.response?.data?.errors[0]?.message) {
      setOrderErrorMessage(error.response.data.errors[0].message);
    } else {
      const errorMessage =
        error?.data?.response?.errors?.message || "Unknown error";
      const errorCode = error?.data?.response?.errors?.code || "N/A";
      setOrderErrorMessage(`Detail: ${errorMessage} (code: ${errorCode})`);
    }
    setIsPlacingOrderWithThirdParty(false);
    setIsLoading(false);
  };

  const redirectToOrderConfirmation = (orderId: string | number): void => {
    const url = `/nbts/orderconfirmation-${orderId}`;

    const handleNavigation = () => {
      document.removeEventListener("visibilitychange", handleNavigation);
      if (document.visibilityState === "hidden") {
        return;
      }
      // setIsLoading(false);
    };

    document.addEventListener("visibilitychange", handleNavigation);

    window.location.href = url;

    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 3000);
  };

  useEffect(() => {
    if (isFetchOrderComplete && !loadingAddresses && !loadingPaymentMethods) {
      if (!order) {
        let buildOrderPayload = getInitialBuildOrderData(
          cartId,
          portalData?.portalId
        );
        if (defaultAddress?.id) {
          buildOrderPayload.shipping = buildOrderPayload.shipping ?? { id: 0 };
          buildOrderPayload.shipping.id = defaultAddress.id;
        }
        if (defaultPaymentMethod?.addressId) {
          buildOrderPayload.billing = buildOrderPayload.billing ?? { id: 0 };
          buildOrderPayload.billing.id = defaultPaymentMethod.addressId;
        }
        if (defaultPaymentMethod) {
          buildOrderPayload.paymentMethod = { id: defaultPaymentMethod.id };
        }

        //add session and user agent data
        buildOrderPayload.userOptions.userSessionID = sessionId;
        buildOrderPayload.userOptions.userAgent = getUserAgent();

        const orderResponse = buildOrder(buildOrderPayload);
        orderResponse.then((response) => {
          if (
            response.response?.errors?.message ===
            "There are no items in your cart."
          ) {
            window.location.href = GET_SHOP_CART_URL();
          }
          setOrderData(response?.response.success?.data || null);
          setOrderNotifications(
            getOrderNotifications(response?.response.success)
          );
        });
      } else {
        if (!order.response.success.data) return;
        const orderResponse = order.response.success.data;
        if (!orderResponse.billingAddress.id) {
          orderResponse.billingAddress.id =
            defaultPaymentMethod?.addressId || defaultAddress?.id;
        }
        if (!orderResponse.shippingAddress.id) {
          orderResponse.shippingAddress.id = defaultAddress?.id;
        }

        setOrderData(orderResponse);
        setOrderNotifications(getOrderNotifications(order.response.success));
      }
    }
  }, [isFetchOrderComplete, loadingAddresses, loadingPaymentMethods, defaultAddress, defaultPaymentMethod]);

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
  }, [defaultAddress, defaultPaymentMethod]);

  const handleUpdateOrderErrorMessage = (message: string) => {
    setOrderErrorMessage(message);
  };

  if (loadingAddresses || loadingPaymentMethods || loadingOrder)
    return <Skeleton />;

  if (addressError || paymentError) return <div>Failed to load data</div>;

  return (
    <div>
      {(isLoading || isPlacingOrderWithThirdParty) && <Spinner />}
      {orderData && (
        <>
          <div className="qa-checkout container">
            <CreditCardFormProvider>
            <div className="checkout-container" id="mfe-checkout-container">
              <div className="left-column">
                <Notifications
                  notificationMessages={orderNotifications || []}
                />
                <Checkout
                  shopperId={shopperId}
                  siteId={siteId}
                  addresses={addresses || []}
                  pcid={pcid}
                />

              {addressList.length > 0 ? (
                <ShippingMethod
                  shopperID={shopperId}
                  isAddressSaved={isAddressSaved}
                />) : (
                  <ShippingMethodHeading />
              )}

              {addressList.length > 0 ? (
                  (orderHasAutoshipItems(orderData) ||
                    orderData.totals.price > 0) && (
                    <PaymentMethod
                      cartId={cartId}
                      shopperId={shopperId}
                      siteId={siteId}
                      pcid={pcid}
                      payments={paymentMethods}
                      updatePaymentTypeId={setPaymentTypeId}
                      updateOrderErrorMessage={handleUpdateOrderErrorMessage}
                    />
                  )
                ) : (
                  <PaymentMethodHeading />
                )}
                {isAddressSaved && 
                 <TextUpdates 
                  pcid={pcid} 
                  siteId={siteId} 
                  setHasPhoneError={setHasPhoneError}
                  mobileRequiredMessage={mobileRequiredMessage}
                  setMobileRequiredMessage={setMobileRequiredMessage}
                 />
                 }
              </div>
              <div
                className={`right-column ${
                  apiMode === "localhost" ? "top-1" : "top-475"
                }`}
              >
                <OrderSummary
                  pcid={pcid}
                  shopperId={shopperId}
                  cartId={cartId}
                  siteId={siteId}
                  isAddressSaved={isAddressSaved}
                />

                <div className="place-order">
                  {isAddressSaved && paymentMethodOptions && (
                    <PlaceOrder
                      confirmOrder={confirmOrder}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      errorMessage={orderErrorMessage}
                      paymentTypeId={paymentTypeId}
                      paymentMethods={paymentMethodOptions}
                      shopperId={shopperId}
                      siteId={siteId}
                      order={orderData}
                      updateOrderErrorMessage={handleUpdateOrderErrorMessage}
                      billingId={defaultAddress?.id || 0}
                      setOrderData={setOrderData}
                      setIsAutoShipChecked={setIsAutoShipChecked}
                      isAutoShipChecked={isAutoShipChecked}
                      hasPhoneError={hasPhoneError}
                      setMobileRequiredMessage={setMobileRequiredMessage}
                      shippingId={
                        defaultPaymentMethod?.addressId ??
                        defaultAddress?.id ??
                        0
                      }
                    />
                  )}
                </div>
              </div>
            </div>
            </CreditCardFormProvider>

            <div className="place-order">
              <Feedback siteId={siteId} pcId={pcid} sessionId={sessionId} />
            </div>
            <HeadHelmet />
            <SessionTimeout />
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

export default withErrorBoundary(
  CheckoutContainer,
  <div>An unexpected error occurred. Please try again later.</div>
);
