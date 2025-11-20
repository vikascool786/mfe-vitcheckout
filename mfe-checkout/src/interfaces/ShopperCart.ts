export interface IShopperCart {
  stores: IStores;
  paymentMethods: IPaymentMethod[];
  quantity: number;
  totals: ITotal;
  id: string;
}

export interface IStores {
  [key: string]: IStoreQuantity;
}

export interface IStoreQuantity {
  quantity: number;
  totals: ITotal;
  items: IItem[];
}

export interface ITotal {
  cashBack: number;
  bv: number;
  ibv: number;
  cashBackApplied?: number;
  walletApplied?: number;
  price: number;
  shipping?: number;
  tax?: number;
  priceStr: string;
  gcBalance?: string;
  cashBackStr: string;
  couponCode?: string;
  couponTerms?: any[];
  coupons?: number;
  taxStr?: string;
  shippingStr?: string;
  cashBackAppliedStr?: string;
  walletAppliedStr?: string;
  couponsStr?: string;
  gcApplied?: number;
  gcAppliedStr?: string;
  extraCashBack?: number;
  gcDispAppliedStr?: string[]
  gcBalanceStr?: string[];
  priceActualStr: string;
  priceActual?: string;
  rebateAmount?: number;
  rebateAmountStr?: string;
}

export interface IItem {
  prodId: string;
  volumeID: number;
  prodContainerId: number;
  productType: string;
  opContainerId: number;
  weight: number;
  image: IImage;
  limitShippingMethodIDs: any[];
  storeMaVendorId: string;
  caption: string;
  catalogSku: string;
  product: IProduct;
  store: IStore;
}

export interface IImage {
  url: string;
}

export interface IProduct {
  caption: string;
  image: IImage;
  maxOrderQuantity: number;
  volumeID: number;
  autoShipEnabled: boolean;
  prodContainerId: number;
  limitShippingMethodIDs: any[];
  productType: string;
  catalogSku: string;
  weight: number;
  storeMaVendorId: string;
  priceInfo: IPriceInfo;
  totals: ITotal;
  catalogName: string;
  id: string;
  date_added: number;
  date_modified: number;
  quantity: number;
  original_quantity: number;
  product_hash: string;
  type: string;
  special_formula: string;
  option: any[];
  userOptions: IUserOptions;
  hasAutoShipDiscount: boolean;
}

export interface IPriceInfo {
  bv: number;
  cashBack: number;
  ibvOnlyCampaign: number;
  actualPrice: number;
  ibvStandardCampaign: number;
  ibv: number;
  ibvStandard: number;
  ibvOnly: number;
  onSale: boolean;
  salePrice: number;
  customerIncentivePoints: number;
  mipAmount: number;
  standardCashBackPercent: number;
  increasedCashBackPercent: number;
}

export interface IUserOptions {
  httpref: string;
  option: any[];
}

export interface IStore {
  catalogName: string;
  catalogId: number;
}

export interface IPaymentMethod {
  id?: number;
  typeID?: number;
  type?: string;
  categoryID?: number;
  visible?: boolean;
  supportedForAutoship?: boolean;
  imageTag?: string;
  number?: string;
  token?: string;
  accountName?: string;
  expMonth?: number;
  expYear?: number;
  cvv?: string;
}

export interface IShopperChangeCart {
  id: string;
  customer_id: string;
  ufo_id: string;
  shipping_country: string;
  product_country: string;
  language: string;
  site_type: string;
  application: string;
  billing: IBilling;
  shipping: IShipping;
  paymentMethod: IPaymentMethod;
  stores: IStores;
  userOptions: IUserOptions;
}

export interface IBilling {
  id: number;
  address1: string;
  city: string;
  state: string;
  region: string;
  zip: string;
  country: string;
  phone: string;
}

export interface IShipping {
  id: number;
  address1: string;
  city: string;
  state: string;
  region: string;
  zip: string;
  country: string;
  phone: string;
}
