import {Order, OrderStore} from "../interfaces/Order";
import {StoreDetail} from "../interfaces/ShippingMethod";
import {isCustomCocktail, isInStockItem} from "./ItemUtils";

export const GIFT_CARD_STORE_VOLUMES = [247642,247643,248193,258502,248659,254277,248192,254278,277416,254279,286748,286749,286750];
export const GIFT_CARD_STORE_CATALOGS = [101062];

export const isGiftCardStore = (store: OrderStore | null): boolean => {
    if (!store) return false;
    const volumeId = Number(store.items?.[0]?.volumeId);
    return GIFT_CARD_STORE_VOLUMES.includes(volumeId) || GIFT_CARD_STORE_CATALOGS.includes(store.store?.catalogId);
};

export const isGiftCardStoreDetail = (storeDetail: StoreDetail | null): boolean => {
    if (!storeDetail) return false;
    const catalogId = Number(storeDetail?.catalogId);
    return GIFT_CARD_STORE_CATALOGS.includes(catalogId);
};

export const isGiftCardForStoreKey = (order: Order, storeKey: string): boolean => {
    return isGiftCardStore(order?.stores?.[storeKey] || null);
};

export const storeHasOOSItems = (store: OrderStore | null): boolean => {
    if (!store) return false;
    const oosItems = store.items.filter(item => !isInStockItem(item));
    return oosItems.length > 0;
};

export const storeHasCustomCocktail = (store: OrderStore | null): boolean => {
    if (!store) return false;
    const customCocktailItems = store.items.filter(item => isCustomCocktail(item));
    return customCocktailItems.length > 0;
};