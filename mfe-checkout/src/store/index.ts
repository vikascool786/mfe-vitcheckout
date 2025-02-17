import { atom, createStore } from "jotai";
import PaypalIcon from "../assets/images/PayPal.png";
import SezzleIcon from "../assets/images/Sezzle.png";
import { Address } from "../interfaces/Address";
import { Order } from "../interfaces/Order";
import { IPaymentMethod } from "../interfaces/PaymentMethod";
import { PAYPAL, SEZZLE } from "../payment-method/PaymentType";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";

export interface IPaymentOption {
  paymentMethod: IPaymentMethod;
  isTempPaymentMethod?: boolean;
  isPaymentValidated: boolean;
  paymentAddress: Address;
  isEditing?: boolean;
  isVisible: boolean;
  isSelected: boolean;
}

const initialPaymentMethods: IPaymentOption[] = [
  {
    paymentMethod: createPaymentMethod({
      accountName: PAYPAL.name,
      typeID: PAYPAL.typeId,
      imageUrl: PaypalIcon,
      id: -1001,
    }),
    paymentAddress: {} as Address,
    isPaymentValidated: false,
    isSelected: false,
    isVisible: true,
  },
  {
    paymentMethod: createPaymentMethod({
      accountName: SEZZLE.name,
      typeID: SEZZLE.typeId,
      imageUrl: SezzleIcon,
      id: -1002,
    }),
    isPaymentValidated: false,
    paymentAddress: {} as Address,
    isSelected: false,
    isVisible: true,
  },
];

export const orderAtom = atom<Order>();

export const addressAtom = atom<Address[]>([]);

export const paymentMethodsAtom = atom<IPaymentOption[]>(initialPaymentMethods);

export const OrderStore = createStore();

export const loadingAtom = atom<boolean>(false);

export const orderNotificationsAtom = atom<string[]>();