type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);
export type StateArray<S> = [S, Dispatch<SetStateAction<S>>];

export enum ListingCategoryEnum {
  STORE = "STORE",
  PRODUCT = "PRODUCT",
}

type Stock = "IN_STOCK" | "OUT_OF_STOCK";

export type PriceRange = {
  min: string;
  max: string;
  minSale: string;
  maxSale: string;
  isOnSale: boolean;
};

export type MappedPermutation = {
  [key: string]: {
    originalPrice: number;
    price: number;
  };
};

export type Supplemental = {
  reviewData: [
    {
      shopRating: number;
      shopReviewCount: number;
    }
  ];
};

export type Reward = {
  type: string;
  value: number;
  percent: string;
};

export type PersonalizedAttributes = {
  isRecentlyPurchased: boolean;
  isRecentlyViewed: boolean;
};

export type DerivedAttributes = {
  isNewArrival: boolean;
  coupon: {
    couponId: number;
    label: string;
    code: string;
    expirationDate: string;
  };
  rewards: Reward[];
};

export type FreeShipping = {
  message: string;
};

export type DerivedMedia = {
  altText: string;
  url: string;
};

export type Derived = {
  productLinkUrl: string;
  reviews: { total: number; decimalRating: number; percentRating: number };
  isNewArrival: boolean;
  isMAProduct: boolean;
  isGlobalProduct: boolean;
  isCPAProduct: boolean;
  hasMultipleOptions: boolean;
  isOneCartProduct: boolean;
  shouldShowAddToCart: boolean;
  retailPrice: PriceRange;
  media: DerivedMedia[];
};

export type ProductItem = {
  caption: string;
  image: { url: string };
  resizeImage: { altText: string };
};

export type ProductOptionValue = {
  sortOrder: number;
  textValue: string;
  image: string;
  xSwatchValue: string;
  swatchResizeImage: any;
  derived: {
    isOutOfStock: boolean;
    retailPrice: PriceRange;
    swatchValue: {
      text: string;
      colorCode: string;
      media: {
        image: string;
      };
    };
  };
};

export type Labels = {
  type: string;
  name: string;
};

export type Coupon = {
  couponId: number;
  label: string;
  code: string;
  expirationDate: string;
};

export type ProductOption = {
  specInstrType: "Color" | "Size";
  values: ProductOptionValue[];
};

export type Product = {
  prodId: string;
  product: ProductItem;
  options: ProductOption[];
  derived: Derived;
  coupon: Coupon;
  freeShipping: { message: string };
  storeName: string;
  rewards?: Reward[];
  labels?: Labels[];
  permutations: any;
};

export type ProductStoreDerived = {
  isNewArrival: boolean;
  isLinkOff: boolean;
  linkUrl: string;
  media: { url: string };
  storePageUrl: string;
  title: string;
};

export type ProductStore = {
  name: string;
  stdCashBack: number;
  wwwLink: string;
  catalogLogo: string;
  derived: ProductStoreDerived;
  labels: Labels[];
  rewards?: Reward[];
  volumeId: number | string;
};

export type PaginationData = {
  totalSize: number;
  size: number;
  currentPage: number;
};

export type Module = "products" | "stores";

export type ModuleOrder = Module[];

export type ModuleRanker = {
  keyword: string;
  modules: ModuleOrder;
};

export type TPagination = {
  page: number;
  size: number;
};

export type AddToCartData = {
  prodId: string;
  option?: string;
  quantity?: string;
  isCustomCocktail?: boolean;
  sku?: string;
  prodName: string;
};
export type APIMODE = "localhost" | "dev" | "staging" | "prod";
