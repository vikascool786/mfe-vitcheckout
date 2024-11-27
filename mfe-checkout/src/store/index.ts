import { atom } from "jotai";
import { Item, Order } from "../interfaces/Order";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";


interface IShippingAtom {
    shippingSelections: ShippingSelection[];
    shippingItems: Item[];
    shippingSelected: ShippingSelection;
}

export const shippingData = atom<IShippingAtom>({} as IShippingAtom);
export const total = atom<ITotal>();
export const orderData = atom<Order>();