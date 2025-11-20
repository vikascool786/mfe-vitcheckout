import { Order } from "../../interfaces/Order";
import { GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY, GET_BASE_URL } from "../../utils/urlResolver";

const APPLE_TIMEOUT = 31000;

export const getOrderTotal = (order: Order) => {
  const storesTotals =
  order?.stores ?
  Object.entries(order?.stores).map(([key, store]) => ({
    key,
    store,
  })) : [];

  return storesTotals.length > 0 ? storesTotals.reduce((acc, curr) => {
    return acc + curr.store.totals.price
  }, 0) : order?.totals.price;
}

export const getLineItems = (order: Order) => {
    const storesTotals =
    order?.stores ?
    Object.entries(order?.stores).map(([key, store]) => ({
      key,
      store,
    })) : [];
  
    const subTotal = storesTotals.length > 0 ? storesTotals.reduce((acc, curr) => {
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
                "label": shp.displayMethod,
                "amount": shp.total,
                "detail": `Estimated Delivery: ${shp.estShipDisplayDate}`,
                "identifier": shp.method
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