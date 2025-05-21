import { Order, OrderStore } from "../../interfaces/Order";
import { isGiftCardStore } from "../StoreUtils";

export const getCatalogName = (storeData: OrderStore): string | undefined => {
  if (!storeData || !storeData.items || storeData.items.length === 0) {
    return undefined;
  }
  const catalogName = storeData?.items[0]?.catalogName;

  if (isGiftCardStore(storeData)) {
    return catalogName;
  }
  return `${catalogName} Shipment` || undefined;
};

export const getShipWarningMessage = (
  storeData: OrderStore
): string | undefined => {
  if (!storeData?.items?.length) {
    return undefined;
  }

  for (const item of storeData.items) {
    if (item.shipWarningMessages?.length) {
      const warningMessage = item.shipWarningMessages[0]?.replace(
        /""([^""]+)""/g,
        '"$1"'
      );
      return warningMessage;
    }
  }

  return undefined;
};
