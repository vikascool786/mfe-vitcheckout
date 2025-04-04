export interface ChangeOrder {
  debug?: boolean;
  id: string;
  customer_id: string;
  ufo_id: string;
  shipping_country: string;
  product_country: string;
  language: string;
  site_type: string;
  application: string;
  billing?: Billing;
  shipping?: Shipping;
  paymentMethod?: PaymentMethod;
  stores?: Store;
  userOptions: UserOptions;
}

export interface Billing {
  id?: number;
  first?: string;
  last?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
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
  applyEWallet: boolean;
  isOfAge: boolean;
  trackingID: string;
  deliveryDate: string;
  signatureRequired: boolean;
  oosConsolidate: number;
  userSessionId: string;
  gcNum?: string[];
  gcPin?: string[];
  coupons?: string[];
  smsPhone?: string;
  smsMessageType?: string;
  tempOrderID?: string;
  portalId?: string;
}
