import { atom, createStore } from "jotai";
import { Order } from "../interfaces/Order";
import { Address } from "../interfaces/Address";

export const orderAtom = atom<Order>();

export const addressAtom = atom<Address[]>([]);

export const OrderStore = createStore();



