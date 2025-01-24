import { Order, OrderStore } from "../../interfaces/Order";

export const getCatalogName = (storeData: OrderStore): string | undefined => {
  if (!storeData || !storeData.items || storeData.items.length === 0) {
    return undefined;
  }

  if (storeData.items[0]?.catalogName === "SHOP.COM") {
    return "Email Delivery - Within 5 minutes";
  }
  return `${storeData.items[0].catalogName} Shipment` || undefined;
};
