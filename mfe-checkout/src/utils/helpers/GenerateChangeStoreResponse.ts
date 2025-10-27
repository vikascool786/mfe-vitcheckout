import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { getAmosUserSessionID, getUserAgent } from "./UserSessionDataHelper";
import { isAddressDefaultMAAddress } from "../AddressUtils";

export const generateChangeStoreResponse = (order: Order, customer_id: string): ChangeOrder => {
  const updatedPayload: ChangeOrder = {
    id: order.id,
    customer_id: customer_id || "",
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
  } else if (order.billingAddress && order.billingAddress.address1 && !isAddressDefaultMAAddress(order.billingAddress)) {
    updatedPayload.billing = updatedPayload.billing ?? {};
    updatedPayload.billing.first = order.billingAddress.first;
    updatedPayload.billing.last = order.billingAddress.last;
    updatedPayload.billing.address1 = order.billingAddress.address1;
    updatedPayload.billing.address2 = order.billingAddress.address2;
    updatedPayload.billing.city = order.billingAddress.city;
    updatedPayload.billing.state = order.billingAddress.state;
    updatedPayload.billing.zip = order.billingAddress.zip;
    updatedPayload.billing.country = order.billingAddress.country;
    updatedPayload.billing.phone = order.billingAddress.phone;
  }

  if (order.shippingAddress?.id) {
    updatedPayload.shipping = { id: order.shippingAddress.id };
  } else if (order.shippingAddress && order.shippingAddress.address1 && !isAddressDefaultMAAddress(order.shippingAddress)) {
    updatedPayload.shipping = updatedPayload.shipping ?? {};
    updatedPayload.shipping.first = order.shippingAddress.first;
    updatedPayload.shipping.last = order.shippingAddress.last;
    updatedPayload.shipping.address1 = order.shippingAddress.address1;
    updatedPayload.shipping.address2 = order.shippingAddress.address2;
    updatedPayload.shipping.city = order.shippingAddress.city;
    updatedPayload.shipping.state = order.shippingAddress.state;
    updatedPayload.shipping.zip = order.shippingAddress.zip;
    updatedPayload.shipping.country = order.shippingAddress.country;
    updatedPayload.shipping.isPoBox = order.shippingAddress.isPoBox;
    updatedPayload.shipping.phone = order.shippingAddress.phone;
  }

  if (order.paymentMethod?.id) {
    updatedPayload.paymentMethod = { id: order.paymentMethod.id };
  }else if (order.paymentMethod && order.paymentMethod.number && order.paymentMethod.token ) {
    updatedPayload.paymentMethod = updatedPayload.paymentMethod ?? {};
    updatedPayload.paymentMethod.number = order.paymentMethod.number;
    updatedPayload.paymentMethod.token = order.paymentMethod.token;
    updatedPayload.paymentMethod.typeID = order.paymentMethod.typeID;
    updatedPayload.paymentMethod.accountName = order.paymentMethod.accountName;
    updatedPayload.paymentMethod.expMonth = order.paymentMethod.expMonth;
    updatedPayload.paymentMethod.expYear = order.paymentMethod.expYear;
    updatedPayload.paymentMethod.cvv = order.paymentMethod?.cvv;
  } else if(order.paymentMethod && order.paymentMethod.typeID && order.paymentMethod.accountName){
    updatedPayload.paymentMethod = updatedPayload.paymentMethod ?? {};
    updatedPayload.paymentMethod.typeID = order.paymentMethod.typeID;
    updatedPayload.paymentMethod.accountName = order.paymentMethod.accountName;
  }

  if(!order.userOptions?.userAgent) {
    updatedPayload.userOptions.userAgent = getUserAgent();
  }

  if(!order.userOptions?.userSessionID) {
    updatedPayload.userOptions.userSessionID = getAmosUserSessionID();
  }

  return updatedPayload;
};
