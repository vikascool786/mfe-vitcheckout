import { Order } from "../interfaces/Order";
import { Portal } from "../interfaces/Portal";
import { FreeShipData } from "../interfaces/FreeShipData";
import { doShippingCalc } from "../api/service/ShippingCalc";
import { isGiftCardStore, storeHasCustomCocktail, storeHasOOSItems } from "./StoreUtils";
import { formattedNumber } from "./OrderUtils";


export const getFreeShipMessagesForOrder = async (order: Order | undefined, portalData: Portal,getString:any): Promise<Map<string, string>> => {
    let freeShipMessageStoreMap = new Map<string, string>();
    if (!order) return freeShipMessageStoreMap;

    const itemList = Object.values(order.stores)
        .flatMap((store) => store.items);

    try {
        const response = await doShippingCalc(portalData.portalId, itemList);

        if (response) {
            Object.entries(order.stores).forEach(([storeId, store]) => {
                const catalogId = store?.store.catalogId.toString();
                let isMAFreeShip = portalData?.hasFreeShipping && Boolean(store?.store.isMA);

                const freeShipData: FreeShipData = {
                    hasFreeShipping: isMAFreeShip,
                    isFreeShipMet: false,
                    freeShipDifference: "",
                    isMA: Boolean(store?.store?.isMA),
                    storeName: store?.store?.catalogName,
                };

                if ((isMAFreeShip || !store?.store?.isMA) && !isGiftCardStore(store)) {
                    if (!store.store?.isMA) {
                        freeShipData.hasFreeShipping = response.quotes[catalogId]?.[0]?.hasFreeShipping ?? false;
                    }

                    if (freeShipData.hasFreeShipping) {
                        const currency = response.quotes[catalogId]?.[0]?.currency;
                        let freeShipDiff = freeShipData?.isMA
                            ? response.quotes[catalogId]?.[0]?.freeShipDiff
                            : response.quotes[catalogId]?.[0]?.freeShippingThreshold?.freeShipDiff;

                        freeShipData.freeShipDifference = `${currency}${formattedNumber(freeShipDiff)}`;
                        freeShipData.isFreeShipMet = freeShipData?.isMA
                            ? response.quotes[catalogId]?.[0]?.freeShipMet || freeShipDiff <= 0
                            : freeShipDiff <= 0;

                        if (freeShipData.hasFreeShipping) {
                            //TODO: will need to revisit this - OOS and custom cocktail do not calculate correctly
                            // with shipping calc
                            // hiding the free ship message if threshold is not met and there are oos or cc items
                            if (!freeShipData.isFreeShipMet && !storeHasOOSItems(store) && !storeHasCustomCocktail(store)) {
                                const message = getString("addForFreeShip",[freeShipData.freeShipDifference,freeShipData.storeName]);
                                freeShipMessageStoreMap.set(catalogId, message);
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error with shipping calc", error);
    }

    return freeShipMessageStoreMap;
};