import { atom } from "jotai";
import { Item, Order } from "../interfaces/Order";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";


interface IShippingAtom {
    shippingSelections: ShippingSelection[] | null;
    shippingItems: Item[];
    shippingSelected: string;
}

export const shippingData = atom<IShippingAtom>();
export const total = atom<ITotal>();