import {ShippingSelection} from "../interfaces/Order";

const PICKUP_SHIP_ID = [1000];
export const SHIP_ID_STANDARD = 43;

export const isPickUp = (id: number): boolean => {
    return PICKUP_SHIP_ID.includes(id);
}

export const getShippingSelectionById = (id: number, storeShippingSelections: ShippingSelection[]): ShippingSelection | undefined => {
    return storeShippingSelections.find(selection => selection.id === id);
}