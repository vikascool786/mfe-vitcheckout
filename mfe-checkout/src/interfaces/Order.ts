import { Address } from "./Address";
import { StoreDetail } from "./ShippingMethod";
import { IPaymentMethod, IStores, ITotal } from "./ShopperCart";

export interface Order {
  orderId: number;
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: IPaymentMethod;
  id: string;
  stores: OrderStores;
  totals: ITotal;
  paymentMethods: IPaymentMethod2[];
  userOptions: IUserOptions;
  isOrderValid?: boolean;
  shouldShowInvalidCVVMessage: boolean;
}

interface OrderStores {
  [key: string]: OrderStore;
}

export interface OrderStore {
  totals: ITotal;
  items: Item[];
  store: StoreDetail;
  shippingSelections: ShippingSelection[];
  shippingMethod: string;
  canConsolidate: boolean;
}

export interface Item {
  prodId: string;
  image: Image;
  caption: string;
  product_hash: string;
  catalogSku: string;
  catalogName: string;
  specialFormula: string;
  quantity: number;
  option: any[];
  autoshipFreq: number;
  autoShipId?: number;
  available?: string;
  totals: ITotal;
  permutation?: Permutation;
  shipWarningMessages?: string[];
}

export interface Image {
  url: string;
}

export interface Permutation {
  inventoryStatus: string;
}

export interface ShippingSelection {
  id: number;
  method: string;
  total: number;
  estShipDate: string;
}

export interface N101062InStock {
  shippingMethod: string;
  deliveryMessage: string;
}

export interface IPaymentMethod2 {
  typeID: number;
  type: string;
  categoryID: number;
  visible: boolean;
  supportedForAutoship?: boolean;
  imageTag: string;
}

export interface IUserOptions {
  applyCashback: boolean;
  applyEWallet: boolean;
  isOfAge: boolean;
  trackingID: string;
  deliveryDate: string;
  deliveryTime: number;
  signatureRequired: boolean;
  oosConsolidate: number;
  userSessionId: string;
  coupons: string[];
  gcNum: string[];
  gcPin: string[];
  smsPhone: string;
  smsMessageType?: string;
  tempOrderID: string;
  portalId: string;
  walletAppliedStr?: string;
}
