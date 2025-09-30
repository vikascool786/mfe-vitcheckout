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
import { useSiteFlags } from "../hooks/useSiteFlags";
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
  siteFlagData,
} from "../store";
import {
  getOrderNotifications,
  isCartOrder,
  isUniversalOrderBuilt,
  orderHasAutoshipItems,
  orderHasDefaultMAShipAddress,
} from "../utils/OrderUtils";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { handleSezzleCheckout, isSezzleSelectedPayment, isSezzleSuccessful } from "../utils/helpers/SezzleHelper";
import { GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY, GET_SHOP_CART_URL } from "../utils/urlResolver";
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
import { CreditCardFormProvider } from "../component/Form/CreditCardFormContext";
import { siteApiData } from "./siteAtom";
import { useContentStrings } from "../hooks/useContentStrings";
import { isSuccessfulPaypalCallback } from "../utils/helpers/PaypalHelper";
import { getUserAgent } from "../utils/helpers/UserSessionDataHelper";
import { TotalAmount } from "./TotalAmount";
import { initiateCheckoutEventListeners } from "./CheckoutEventListeners";
import { Contact } from "../contact/Contact";
import { CartOrderSummary } from "../order-summary/CartOrderSummary";
import { DEFAULT_CART_DATA, ShoppingCart } from "../interfaces/ShoppingCart";
import { getShoppingCart } from "../api/ajaxaction/ShoppingCart";
import { customerApiData } from "./customerAtom";
import { setGuestEmailForSession } from "../api/ajaxaction/FamosSession";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const getInitialBuildOrderData = (
  cartId: string,
  portalId: string,
  pcid: string
): ChangeOrder => ({
  id: cartId,
  customer_id: pcid || "",
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
  portalId: string;
  isGuest: boolean;
}

const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
  pcid,
  siteId,
  sessionId,
  portalId,
  isGuest
}) => {
  const [orderData, setOrderData] = useAtom(orderAtom);
  const { getContent,getString } = useContentStrings();
  const { siteFlags, fetchSiteFlagInfo } = useSiteFlags();
  const [showEmptyOrder, setShowEmptyOrder] = useState(false);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");
  const [paymentTypeId, setPaymentTypeId] = useState(0);
  const hasInitializedOrder = useRef(false); // Prevent multiple executions of updateOrder
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const apiMode = GET_API_MODE();
  const [customerId, setCustomerId] = useState(pcid);


  const [isAutoShipChecked, setIsAutoShipChecked] = useState<boolean>(false);
  const addressList = useAtomValue(addressAtom);
  const paymentMethodOptions = useAtomValue(paymentMethodsAtom);
  const [currentPortalId, setCurrentPortalId] = useState(portalId);
  const portalKey = useMemo(() => JSON.stringify({ shopperId, currentPortalId }), [shopperId, currentPortalId]);
  const [portalData] = useAtom(portalApiData(portalKey));
  const memorizedSiteId = useMemo(() => siteId, [siteId]);
  const [siteData] = useAtom(siteApiData(memorizedSiteId));
  const [hasPhoneError, setHasPhoneError] = useState<boolean>(false);
  const [isGuestEmailInvalid, setIsGuestEmailInvalid] = useState<boolean>(false);
  const [mobileRequiredMessage, setMobileRequiredMessage] =
    useState<boolean>(false);
    const [isCheckboxChecked, setIsCheckboxChecked] =
    useState<boolean>(false);
  const isAddressSaved = useMemo(() => {
    const hasSavedAddress = addressList.length >= 1 && addressList.some(
        (address) => address.hasAddress === 1
    );
    const orderHasSavedShipAddress = !orderHasDefaultMAShipAddress(orderData || null);
    return hasSavedAddress && orderHasSavedShipAddress;
  }, [addressList, orderData]);

  const [isPlacingOrderWithThirdParty, setIsPlacingOrderWithThirdParty] = useState<boolean>(false);

  const customerDataAtom = useMemo(() => customerApiData(customerId), [customerId]);
  const [customerData] = useAtom(customerDataAtom);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [cartData, setCartData] = useState<ShoppingCart>(DEFAULT_CART_DATA);
  const [useCartSummary, setUseCartSummary] = useState<boolean>(isGuest);
  const [shopperEmail, setShopperEmail] = useState<string>("");

  const addressUrl = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?siteId=${siteId}&api_key=${apiKey}`;
  const paymentUrl = `${apiDomain}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${apiKey}`;
  const checkoutUrl = `${apiDomain}/checkout-universal/v1/checkouts?api_key=${apiKey}`;
  const fetchOrderUrl = `${apiDomain}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${apiKey}`;

  useEffect(() => {
    fetchSiteFlagInfo(siteId);
  }, []);

  useEffect(() => {
    if(isSezzleSelectedPayment(location.search)){
      if(isGuest && !customerId) {
        return;
      }
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
          cartId,
          customerId,
          isGuest,
      );
    } else if(isSuccessfulPaypalCallback(location.search)){
      setIsPlacingOrderWithThirdParty(true);
      setIsLoading(true);
    }
  }, [location.search, customerId]);

  useEffect(() => {
    getContent(siteData);
    setDataObjectProperty("pageName", "singlePage");
    setDataObjectProperty("pageType", "checkout");
  }, []);

  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    error: addressError,
  } = useApi<Address[] | null>(addressUrl, "GET", null, undefined, !isGuest);

  const {
    data: paymentMethods = [],
    isLoading: loadingPaymentMethods,
    error: paymentError,
  } = useApi<IPaymentMethod[] | null>(paymentUrl, "GET", null, undefined, !isGuest);

  const {
    data: order,
    isLoading: loadingOrder,
    postData,
    error: orderError,
    isComplete: isFetchOrderComplete,
  } = useApi<OrderResponse>(fetchOrderUrl, "GET", null, undefined, true);

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    initiateCheckoutEventListeners();
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
      }, customerId)
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

  const checkOrderConfirmationFlag = (siteFlagData: siteFlagData[]) => {
    return siteFlagData.find(flag => (flag.flagID === 646 && flag.active == true)) ?? false;
  };

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

    if(isGuest){
      const orderEmail = shopperEmail.length < 1 && orderData ? orderData.email : shopperEmail;
      setGuestEmailForSession(orderEmail).finally(() => {
            commitFinalOrder(processedOrders);
      })
    } else{
      commitFinalOrder(processedOrders);
    }
  };

  const commitFinalOrder = (processedOrders: string[]) => {
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
  }

  const handleOrderError = (error: any) => {
    let processedOrders = getProcessedOrders().filter((id) => id !== cartId);
    setProcessedOrders(processedOrders);

    if (error?.response?.data?.errors[0]?.message) {
      setOrderErrorMessage(error.response.data.errors[0].message);
    } else {
      const errorMessage =
        error?.data?.response?.errors?.message || "Unknown error";
      setOrderErrorMessage(getString("errorDetailMessage",[errorMessage]) as string);
    }
    setIsPlacingOrderWithThirdParty(false);
    setIsLoading(false);
  };

  const redirectToOrderConfirmation = (orderId: string | number): void => {
    const v2Slug = `/v2/orderconfirmation-${orderId}`;
    const v1Slug = isGuest ? `/guestcheckout/orderconfirmation?guestOrderId=${orderId}` : `/orderconfirmation-${orderId}`;
    const orderConfirmationUrl = `/nbts${checkOrderConfirmationFlag(siteFlags) ? v2Slug : v1Slug }`;

    const handleNavigation = () => {
      document.removeEventListener("visibilitychange", handleNavigation);
      if (document.visibilityState === "hidden") {
        return;
      }
      // setIsLoading(false);
    };

    document.addEventListener("visibilitychange", handleNavigation);

    window.location.href = orderConfirmationUrl;

    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 3000);
  };

  useEffect(() => {
    if (isFetchOrderComplete && !loadingAddresses && !loadingPaymentMethods) {
      if (!order) {
        if(isGuest && customerId.length < 1){ //do not build the order until we have a pcid/customerId
          return;
        }
        let buildOrderPayload = getInitialBuildOrderData(
          cartId,
          portalData?.portalId,
          customerId
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
            `${getString("emptyCartMessage")}.`
          ) {
            window.location.href = GET_SHOP_CART_URL();
          }
          setOrderData(response?.response.success?.data || null);
          setOrderNotifications(
            getOrderNotifications(response?.response.success)
          );
          handleSetSkeleton((loadingAddresses || loadingPaymentMethods || loadingOrder), response?.response.success?.data);
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
        handleSetSkeleton((loadingAddresses || loadingPaymentMethods || loadingOrder), orderResponse);
      }
    }
  }, [isFetchOrderComplete, loadingAddresses, loadingPaymentMethods, defaultAddress, defaultPaymentMethod]);

  function handleSetSkeleton(isLoading: boolean, orderResponse: Order) {
    setShowSkeleton(isLoading || !orderResponse);
  }

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

  useEffect(() => {
    if(isGuest){
      setShowSkeleton(false);
    }
  }, []);

  useEffect(() => {
    if(orderData){
      setUseCartSummary(isCartOrder(orderData));
    } else if (isGuest) { //only need the cartData for rendering guest view on initial load of checkout
      getShoppingCart().then(response => {
            setCartData(response);
          }
      )
    }

  }, [orderData]);

  const handleUpdateOrderErrorMessage = (message: string) => {
    setOrderErrorMessage(message);
  };

  if (showSkeleton)
    return <Skeleton />;

  if (addressError || paymentError) return <div>{getString("failedToLoadData")}</div>;

  return (
    <div>
      {(isLoading || isPlacingOrderWithThirdParty) && <Spinner />}

      {(orderData || isGuest) && (
        <>
          <div className="qa-checkout container">
            <CreditCardFormProvider>
            <div className="checkout-container" id="mfe-checkout-container">
              <div className="left-column">
                <Notifications
                  notificationMessages={orderNotifications || []}
                />
                <TotalAmount cartData={useCartSummary ? cartData : [] as any}/>
                {isGuest && (
                    <Contact portalId={currentPortalId} cartId={cartId} setCustomerId={setCustomerId}
                             setOrderData={setOrderData} setUseCartSummary={setUseCartSummary}
                             customerData={customerData} setShopperEmail={setShopperEmail} addressList={addressList}
                             order={orderData} setCurrentPortalId={setCurrentPortalId} setIsGuestEmailInvalid={setIsGuestEmailInvalid}/>
                )}
                <Checkout
                  shopperId={shopperId}
                  siteId={siteId}
                  addresses={addresses || []}
                  pcid={customerId}
                  isGuest={isGuest}
                  customerData={customerData}
                  isUniversalOrderBuilt={isUniversalOrderBuilt(orderData)}
                />

                <ShippingMethod
                  shopperID={shopperId}
                  isAddressSaved={isAddressSaved}
                  portalId={currentPortalId}
                  pcid={customerId}
                  isGuest={isGuest}
                  cartData={cartData}
                  setCartData={setCartData}
                  siteData={siteData}
                />

              {(isAddressSaved && customerId.length > 0) ? (
                  (orderHasAutoshipItems(orderData) ||
                    orderData.totals.price > 0) && (
                    <PaymentMethod
                      cartId={cartId}
                      shopperId={shopperId}
                      siteId={siteId}
                      pcid={customerId}
                      isVisible={orderHasAutoshipItems(orderData) ||
                          orderData.totals.price > 0}
                      payments={paymentMethods}
                      updatePaymentTypeId={setPaymentTypeId}
                      updateOrderErrorMessage={handleUpdateOrderErrorMessage}
                      portalId={currentPortalId}
                      isGuest={isGuest}
                    />
                  )
                ) : (
                  <PaymentMethodHeading />
                )}
                {(isAddressSaved && customerId.length > 0) &&
                 <TextUpdates 
                    pcid={customerId}
                    siteId={siteId}
                    hasPhoneError={hasPhoneError}
                    setHasPhoneError={setHasPhoneError}
                    mobileRequiredMessage={mobileRequiredMessage}
                    setMobileRequiredMessage={setMobileRequiredMessage}
                    setIsCheckboxChecked={setIsCheckboxChecked}
                    isCheckboxChecked={isCheckboxChecked}
                 />
                 }
              </div>
              <div
                className={`right-column ${
                  apiMode === "localhost" ? "top-1" : "top-475"
                }`}
              >
                { useCartSummary ? (
                    <CartOrderSummary cartData={cartData}/>
                ) : (
                    <OrderSummary
                        pcid={customerId}
                        shopperId={shopperId}
                        cartId={cartId}
                        siteId={siteId}
                        isAddressSaved={isAddressSaved}
                        portalId={currentPortalId}
                        isGuest={isGuest}
                    />
                )}
                <div className="notifications-mobile">
                  <Notifications notificationMessages={orderNotifications || []} />
                </div>  
                <div className="place-order">
                  {(isAddressSaved && customerId.length > 0 && paymentMethodOptions) && (
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
                      isGuestInvalid={isGuestEmailInvalid}
                      isCheckboxChecked={isCheckboxChecked}
                      setMobileRequiredMessage={setMobileRequiredMessage}
                      shippingId={
                        defaultPaymentMethod?.addressId ??
                        defaultAddress?.id ??
                        0
                      }
                      pcid={customerId}
                      isGuest={isGuest}
                      cartId={cartId}
                    />
                  )}
                </div>
              </div>
            </div>
            </CreditCardFormProvider>

            <div className="place-order">
              <Feedback siteId={siteId} pcId={customerId} sessionId={sessionId} />
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

const ErrorFallback = () => {
  const { getString } = useContentStrings();
  return <div>{getString("unexpectedErrorTryAgain")}</div>;
};

export default withErrorBoundary(CheckoutContainer, <ErrorFallback />);
