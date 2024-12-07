import { atom, createStore } from "jotai";
import { Order } from "../interfaces/Order";

export const orderAtom = atom<Order>();

export const OrderStore = createStore();



