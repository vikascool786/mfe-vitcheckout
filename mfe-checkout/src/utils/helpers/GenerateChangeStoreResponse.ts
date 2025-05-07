import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { getAmosUserSessionID, getUserAgent } from "./UserSessionDataHelper";

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
      applyEWallet: order.userOptions.applyEWallet,
      isOfAge: order.userOptions.isOfAge,
      trackingID: order.userOptions.trackingID,
      deliveryDate: order.userOptions.deliveryDate,
      signatureRequired: order.userOptions.signatureRequired,
      oosConsolidate: Number(order.userOptions.oosConsolidate),
      userSessionID: order.userOptions.userSessionID,
      gcNum: order.userOptions.gcNum,
      gcPin: order.userOptions.gcPin,
      coupons: order.userOptions?.coupons
        ? order.userOptions.coupons
        : ([] as string[]),
      tempOrderID: order.userOptions?.tempOrderID,
      smsPhone: order.userOptions?.smsPhone,
      smsMessageType: order.userOptions.smsMessageType,
      portalId: order.userOptions?.portalId,
      userAgent: order.userOptions?.userAgent,
    },
  };

  // Conditionally add properties
  if (order.billingAddress?.id) {
    updatedPayload.billing = { id: order.billingAddress.id };
  } else if (order.billingAddress && order.billingAddress.address1) {
    updatedPayload.billing = updatedPayload.billing ?? {};
    updatedPayload.billing.first = order.billingAddress.first;
    updatedPayload.billing.last = order.billingAddress.last;
    updatedPayload.billing.address1 = order.billingAddress.address1;
    updatedPayload.billing.address2 = order.billingAddress.address2;
    updatedPayload.billing.city = order.billingAddress.city;
    updatedPayload.billing.state = order.billingAddress.state;
    updatedPayload.billing.zip = order.billingAddress.zip;
    updatedPayload.billing.country = order.billingAddress.country;
  }

  if (order.shippingAddress?.id) {
    updatedPayload.shipping = { id: order.shippingAddress.id };
  }

  if (order.paymentMethod?.id) {
    updatedPayload.paymentMethod = { id: order.paymentMethod.id };
  }

  if(!order.userOptions?.userAgent) {
    updatedPayload.userOptions.userAgent = getUserAgent();
  }

  if(!order.userOptions?.userSessionID) {
    updatedPayload.userOptions.userSessionID = getAmosUserSessionID();
  }

  return updatedPayload;
};
