import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";

export const generateChangeStoreResponse = (order: Order): ChangeOrder => {
  const updatedPayload: ChangeOrder = {
    id: order.id,
    customer_id: "",
    ufo_id: "",
    shipping_country: order.shippingAddress.isoalpha3Code || "USA",
    product_country: order.billingAddress.isoalpha3Code || "USA",
    language: "ENG",
    site_type: "W",
    application: "cart",
    billing: {
      id: order.billingAddress.id || 0,
    },
    shipping: {
      id: order.shippingAddress.id || 0,
    },
    paymentMethod: {
      id: order.paymentMethod.id,
    },
    stores: Object.keys(order.stores).reduce((acc, key) => {
      const store = order.stores[key];
      acc[key] = {
        shippingMethod: store?.shippingMethod || "",
        deliveryMessage: store?.shippingSelections?.[0]?.estShipDate || "", // Assumed first selection
      };
      return acc;
    }, {} as ChangeOrder["stores"]),
    userOptions: {
      applyCashback: order.userOptions.applyCashback,
      applyEWallet: order.userOptions.applyEWallet,
      isOfAge: order.userOptions.isOfAge,
      trackingId: order.userOptions.trackingId,
      deliveryDate: order.userOptions.deliveryDate,
      deliveryTime: order.userOptions.deliveryTime,
      signatureRequired: order.userOptions.signatureRequired,
      oosConsolidate: order.userOptions.oosConsolidate,
      userSessionId: order.userOptions.userSessionId,
      coupons: order.userOptions?.coupons ? order.userOptions.coupons : [] as string[],
    },
  };
  return updatedPayload;
};
