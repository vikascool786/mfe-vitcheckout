//This is the shopping cart object that FAMOS builds

export interface ShoppingCart {
  shoppingCartData: ShoppingCartData;
}

export const DEFAULT_CART_DATA: ShoppingCart = {
  shoppingCartData: {
    totalItems: 0,
    totals: {
      prices: {
        priceDisplay: "",
        priceValue: 0
      },
      rewards: {
        cashbackDisplay: "",
        cashbackValue: 0,
        customerIncentivePointsDisplay: "",
        customerIncentivePoints: 0,
        bvDisplay: "",
        bvValue: 0,
        ibvDisplay: "",
        ibvValue: 0,
        ibvOnly: 0
      }
    }
  }
}

interface ShoppingCartData {
  totalItems: number;
  totals: Totals;
  storeData?: StoreData[];
  cartId?: string;
}

interface CartShippingData {
  maCatalog: boolean;
  freeShippingMet: boolean;
  freeShipDifference: number;
  reqMinPurchase: number;
}

interface Totals {
  prices: Prices;
  rewards: Rewards;
}

interface Prices {
  priceDisplay: string;
  priceValue: number;
}

interface Rewards {
  cashbackDisplay: string;
  cashbackValue: number;
  customerIncentivePointsDisplay: string;
  customerIncentivePoints: number;
  bvDisplay: string;
  bvValue: number;
  ibvDisplay: string;
  ibvValue: number;
  ibvOnly: number;
}

interface StoreData {
  storeName: string;
  storeUrl: string;
  storeVolumeId: number;
  catalogId: string;
  items: Items[];
  shippingData: CartShippingData;
  totals: Totals;
}

interface Items {
  shoppingCartItemId: string;
  prodId: number;
  prodcontainerId: number;
  imagePath: string;
  title: string;
  special_formula?: string;
  catalogSku: string;
  quantity: number;
  options: Options[];
  userOptions: UserOptions;
  totals: Totals;
}

export interface Options {
  prompt: string;
  value: string;
  promptDisplay: string;
}

interface UserOptions {
  autoShipFrequency: number;
}