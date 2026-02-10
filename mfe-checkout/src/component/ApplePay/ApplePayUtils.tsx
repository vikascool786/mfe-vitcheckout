import { Order } from "../../interfaces/Order";
import { GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY, GET_API_MODE, GET_BASE_URL } from "../../utils/urlResolver";
import { OrderStores } from "../../interfaces/Order";

const APPLE_TIMEOUT = 31000;

const SUPPORTED_VERSIONS = [14, 12, 10, 8, 6, 3];

const MERCHANT_IDS: Record<string, string> = {
  dev: 'merchant.com.marketamerica.test.shopapp2',
  localhost: 'merchant.com.marketamerica.test.shopapp2',
  staging: 'merchant.com.marketamerica.test.shopapp2',
  prod: 'merchant.com.marketamerica.prod.shopapp2',
};

export const getOrderTotal = (order: Order, isGuest = false) => {
  const storesTotals =
  order?.stores ?
  Object.entries(order?.stores).map(([key, store]) => ({
    key,
    store,
  })) : [];

  const total = order?.totals?.price ? order?.totals.price: storesTotals.length > 0 || isGuest ? storesTotals.reduce((acc, curr) => {
    return acc + curr.store.totals.price
  }, 0) : 0;

  return total;
}

export const getLineItems = (order: Order, isGuest =false) => {
    const storesTotals =
    order?.stores ?
    Object.entries(order?.stores).map(([key, store]) => ({
      key,
      store,
    })) : [];
  
    const subTotal = storesTotals.length > 0 || isGuest ? storesTotals.reduce((acc, curr) => {
      return acc + curr.store.totals.price
    }, 0) : order?.totals.price;
    const couponsArray = order?.userOptions?.coupons || []
    const couponTotal =  couponsArray.length > 0 ?
    storesTotals.reduce((acc, curr) => {
        return acc + (curr?.store?.totals?.coupons || 0);
    }, 0) : null;

    const shippingTotal = order.totals?.shipping || 0;


    return [
      ...(order?.totals.cashBack ? [{
        type: "final", label: 'VIFT Cashback earned', amount: order?.totals.cashBack
      }]: []),
      ...(couponTotal  ? [{
        type: "final", label: 'Coupon', amount: couponTotal
      }]: []),
      ...(shippingTotal > 0 ? [{
        type: "final", label: 'Shipping', amount: shippingTotal
      }]: []),
      ...(order?.totals?.tax ? [{
        type: "final", label: 'Tax', amount: order?.totals?.tax
      }]: []),
      { type: 'final', label: 'Subtotal', amount: subTotal },
    ]
  }

  export const getShippingMethodsFromOrder = (order: Order) => {
    if (order?.stores) {
      const stores = Object.keys(order?.stores || {});
      if (stores.length === 1) {
        const onlyStore = stores[0];
        if (onlyStore) {
          if (Object.hasOwn(order.stores, onlyStore)) {
            const shippingSelections = order.stores[onlyStore]?.shippingSelections!;
            return shippingSelections.map(shp => ({
              "id": shp.id,
                "label": shp.displayMethod,
                "amount": shp.total,
                "detail": `Estimated Delivery: ${shp.estShipDisplayDate}`,
                "identifier": shp.method,
                
            }))
          }
        }
      }
    }
    return [];
  }

export const getMerchantSession = async () => {
  const merchantUrl = `${GET_BASE_URL}/ajaxaction/apple-pay/session`;
  const res = await fetch(merchantUrl, {
    method: "GET"
  });
  return res.json();
}

  export const decryptAppleData = async (payment: any, total: string, currencyCode: string) => {
    const apiUrl = `${GET_BASE_URL}/ajaxaction/apple-pay/payment`;
             const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
             signal: AbortSignal.timeout(APPLE_TIMEOUT), // abort the req once apple timesout after 30s
            body: JSON.stringify({
              transactionAmount: total,
              transactionCurrency: "USD",
              payload: payment
            })
          });
         return res.json();
  }

  export const savePaymentMethod = async (payment: any, shopperID: string) => {
    const apiUrl = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperID}?api_key=${GET_API_KEY()}`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(payment).toString()
       });
  return res.json();
  }

  export const haveShippingMethodsChanged = (oldMethods: any[], newMethods: any[]) => {
    if (oldMethods.length !== newMethods.length) {
      return true;
    }
  
    const oldMap = new Map();
    oldMethods.forEach(method => oldMap.set(method.id, method));
  
    for (const newMethod of newMethods) {
      const oldMethod = oldMap.get(newMethod.id);
  
      if (!oldMethod) {
        return true;
      }
  
      if (
        oldMethod.amount !== newMethod.amount ||
        oldMethod.identifier !== newMethod.identifier ||
        oldMethod.estShipDate !== newMethod.estShipDate ||
        oldMethod.label !== newMethod.label

      ) {
        return true;
      }

    }
  

    return false;
  }

  export const handleStoreShippingSelections = (method: string, order: Order): OrderStores => {
    let updatedStores = updateStoreShippingMethod(order?.stores || {}, method);
      return updatedStores;
  }

  function updateStoreShippingMethod(stores: OrderStores, method: string): OrderStores {
    const storeKey =Object.entries(stores)[0]![0];
    if (!storeKey) {
      return stores;
    }
    const store = stores[storeKey];
    if (!store) return stores;

    return {
      ...stores,
      [storeKey]: {
        ...store,
        shippingMethod: method,
      },
    };
  }

  export const getCurrentSelectedShipping = (order: Order) => {

    const stores = Object.entries(order.stores)[0]![1];
    return stores.shipping;
  }

  export function getSupportedApplePayVersion(): number | null {
    const ApplePaySession = (window as any).ApplePaySession;
    if (!ApplePaySession) return null;
  
    for (const version of SUPPORTED_VERSIONS) {
      if (ApplePaySession.supportsVersion(version)) {
        console.log('Supported version::', version);
        return version;
      }
    }
  
    return null;
  }

  export const getAppleMerchantId = (): string => {
    const apiMode = GET_API_MODE();
    return MERCHANT_IDS[apiMode] || '';
  }

  export async function detectApplePayEligibility(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ApplePaySession) {
      return false;
    }
    const {ApplePaySession} = window;
    const merchantId = getAppleMerchantId();
    if ("applePayCapabilities" in ApplePaySession) {
      try {
        const capabilities = await ApplePaySession.applePayCapabilities(merchantId);
        return capabilities.paymentCredentialStatus !== "applePayUnsupported";
      } catch (err) {
        console.log('Apple pay capability error::', err)
        return false;
      }
    }
    try {
      return await ApplePaySession.canMakePayments();
    } catch(err) {
      console.log('Apple pay legacy check error::', err);
      return false;
    }
  }