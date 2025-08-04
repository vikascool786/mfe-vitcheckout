import { ShopperAttribute } from "../interfaces/ShopperAttribute";
import { Portal } from "../interfaces/Portal";
import { Item } from "../interfaces/ShippingMethod";

export const showAutoshipDiscountForItem = (shopperAttributes: ShopperAttribute[], portal: Portal, item: Item, isMaProduct: boolean): boolean => {
    return (getAutoshipDiscount(shopperAttributes, portal) > 0 && isMaProduct && item.hasAutoShipDiscount);
}

export const isAutoshipSelectedForItem = (item: Item): boolean => {
    return item.autoshipFreq > 0 || item.autoShipId != null;
}

export const getAutoshipDiscount = (shopperAttributes: ShopperAttribute[], portal: Portal): number => {
    const override = shopperAttributes.find(
        (entry) => entry.typeId === 239 && entry.value > 0
    );
    return override ? Number(override.text) : portal?.autoShipDiscount;
}