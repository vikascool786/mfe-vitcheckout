import { Order, OrderStore } from "../../interfaces/Order";

export const getCatalogName = (storeData: OrderStore): string | undefined => {
  if (!storeData || !storeData.items || storeData.items.length === 0) {
    return undefined;
  }
  return storeData.items[0].store.catalogName || undefined;
};
