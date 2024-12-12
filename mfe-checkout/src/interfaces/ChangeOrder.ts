export interface ChangeOrder {
  id: string;
  customer_id: string;
  ufo_id: string;
  shipping_country: string;
  product_country: string;
  language: string;
  site_type: string;
  application: string;
  billing: Billing;
  shipping: Shipping;
  paymentMethod: PaymentMethod;
  stores: Store;
  userOptions: UserOptions;
}

export interface Billing {
  id: number;
}

export interface Shipping {
  id: number;
}

export interface PaymentMethod {
  id: number;
}

export interface Store {
  [key: string]: StoreMethods;
}
export interface StoreMethods {
  shippingMethod: string;
  deliveryMessage: string;
}

export interface UserOptions {
  applyCashback: boolean;
  applyEWallet: boolean;
  isOfAge: boolean;
  trackingId: string;
  deliveryDate: string;
  deliveryTime: number;
  signatureRequired: boolean;
  oosConsolidate: boolean;
  userSessionId: string;
  gcNum: string[];
  gcPin: string[];
  coupons: string[];
}
