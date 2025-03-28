import { Item } from "../interfaces/Order";

const CUSTOM_COCKTAIL_PROD_CONTAINER_ID = "644795701";
const OOS_STATUSES = ["TEMPORARILY_OUT_OF_STOCK", "PRE_ORDER"];

export const isCustomCocktail = (item: Item | null): boolean => {
    if (!item) return false;
    return item?.prodContainerId === CUSTOM_COCKTAIL_PROD_CONTAINER_ID;
};

export const isInStockItem = (item: Item | null): boolean => {
    if (!item) return false;
    const inventoryStatus = item?.permutation?.inventoryStatus || "";
    return !inventoryStatus ? true : !OOS_STATUSES.includes(inventoryStatus);
};

export const getItemEstimatedShipDate = (item: Item | null): string => {
    if (!item) return "";
    return item?.available || "";
};

export const hasEstimatedShipDate = (item: Item | null): boolean => {
    const estimatedShipDate = getItemEstimatedShipDate(item);
    return estimatedShipDate.length > 1; //checking length because availability field can return as "0"
};