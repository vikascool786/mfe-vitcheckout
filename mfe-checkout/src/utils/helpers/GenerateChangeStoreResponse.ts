import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";

export const generateChangeStoreResponse = (order: Order): ChangeOrder => {
  const updatedPayload: ChangeOrder = {
    id: order.id,
    customer_id: "",
    ufo_id: "",
    shipping_country: order.shippingAddress?.isoalpha3Code || "USA",
    product_country: order.billingAddress?.isoalpha3Code || "USA",
    language: "ENG",
    site_type: "W",
    application: "cart",
    stores: Object.keys(order?.stores).reduce((acc, key) => {
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
      trackingID: order.userOptions.trackingID,
      deliveryDate: order.userOptions.deliveryDate,
      deliveryTime: order.userOptions.deliveryTime,
      signatureRequired: order.userOptions.signatureRequired,
      oosConsolidate: order.userOptions.oosConsolidate,
      userSessionId: order.userOptions.userSessionId,
      gcNum: order.userOptions.gcNum,
      gcPin: order.userOptions.gcPin,
      coupons: order.userOptions?.coupons
        ? order.userOptions.coupons
        : ([] as string[]),
    },
  };

  // Conditionally add properties
  if (order.billingAddress?.id) {
    updatedPayload.billing = { id: order.billingAddress.id };
  }

  if (order.shippingAddress?.id) {
    updatedPayload.shipping = { id: order.shippingAddress.id };
  }

  if (order.paymentMethod?.id) {
    updatedPayload.paymentMethod = { id: order.paymentMethod.id };
  }

  return updatedPayload;
};
