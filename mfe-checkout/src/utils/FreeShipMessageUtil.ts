import { Order } from "../interfaces/Order";
import { Portal } from "../interfaces/Portal";
import { FreeShipData } from "../interfaces/FreeShipData";
import { isGiftCardStore, storeHasOOSItems } from "./StoreUtils";
import { formattedNumber, isCartOrder } from "./OrderUtils";

export const getFreeShipInfoFromOrder = (order: Order | null, portalData: Portal, currencySymbol: string, getString:any): Map<string, string> => {
    let freeShipMessageStoreMap = new Map<string, string>();
    if (order && !isCartOrder(order)) {
        Object.entries(order.stores).forEach(([storeId, store]) => {
            const catalogId = store?.store?.catalogId?.toString();
            let isMAFreeShip = portalData?.hasFreeShipping && Boolean(store?.store?.isMA);

            const freeShipData: FreeShipData = {
                hasFreeShipping: isMAFreeShip,
                isFreeShipMet: false,
                freeShipDifference: "",
                isMA: Boolean(store?.store?.isMA),
                storeName: store?.store?.catalogName,
            };

            if ((isMAFreeShip || !store?.store?.isMA) && !isGiftCardStore(store)) {
                if (!store.store?.isMA) {
                    freeShipData.hasFreeShipping = (store?.store?.freeShipThreshold ?? 0) > 0;
                }

                if (freeShipData.hasFreeShipping) {
                    const currency = currencySymbol;
                    let freeShipDiff = store?.store?.freeShipDiff ?? 0;

                    freeShipData.freeShipDifference = `${currency}${formattedNumber(freeShipDiff)}`;
                    freeShipData.isFreeShipMet = (store?.store?.freeShipMet ?? 0) > 0;

                    if (freeShipData.hasFreeShipping && !freeShipData.isFreeShipMet) {
                            const message = getString("addForFreeShip",[freeShipData.freeShipDifference,freeShipData.storeName]);
                            const freeShipStoreKey = storeHasOOSItems(store) ? storeId : catalogId; //catalogId will be the same for split shipments, need to distinguish different with store key
                            freeShipMessageStoreMap.set(freeShipStoreKey, message);
                    }
                }
            }
        });
    }
    return freeShipMessageStoreMap;
};