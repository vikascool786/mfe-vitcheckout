import { Order } from "./Order";

export interface Address {
  id: number;
  description: string;
  first: string;
  last: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  isoalpha3Code: string;
  region: string;
  zip: string;
  phone: string;
  isPoBox: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  html: string;
  token: string;
  accountName: string;
  mask: string;
  expMonth: number;
  expYear: number;
  typeID: number;
}

export interface ShippingSelection {
  id: number;
  method: string;
  displayMethod: string;
  total: number;
  estShipDate: string;
  estShipDisplayDate: string;
  isSelected?: boolean;
  totalStr: string;
}

export interface Item {
  prodId: string;
  image: { url: string };
  caption: string;
  catalogSku: string;
  catalogName: string;
  quantity: number;
  option?: Array<{ optionStringValue: string; name: string; type: string }>;
  autoshipFreq: number;
  autoShipId?: number;
  hasAutoShipDiscount: boolean;
  totals: {
    price: number;
    cashBack: number;
    bv: number;
    ibv: number;
    cashBackStr?: string;
    priceStr?: string;
  };
  product_hash: string;
  prodContainerId: string;
  special_formula: string;
}
export interface StoreDetail {
  catalogId: number;
  catalogName: string;
  isMA: number;
  marketFacilitator: number;
  vendorShipTax: number;
  vendorShipTaxPct: number;
}

export interface Store {
  totals: { price: number; cashBack: number; bv: number; ibv: number };
  items: Item[];
  shippingSelections: ShippingSelection[];
  shippingMethod: string;
}

export interface ResponseData {
  orderId: number;
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  stores: Record<string, Store>;
  paymentMethods: PaymentMethod[];
  userOptions: {
    applyEWallet: boolean;
    isOfAge: boolean;
    coupons: number[];
  };
}

export interface ApiResponse {
  response: {
    success: {
      data: Order;
    };
  };
}
