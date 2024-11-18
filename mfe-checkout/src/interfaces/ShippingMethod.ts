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
    total: number;
    estShipDate: string;
  }
  
  export interface Item {
    prodId: string;
    image: { url: string };
    caption: string;
    catalogSku: string;
    catalogName: string;
    quantity: number;
    totals: {
      price: number;
      cashBack: number;
      bv: number;
      ibv: number;
    };
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
      applyCashback: boolean;
      applyEWallet: boolean;
      isOfAge: boolean;
      coupons: number[];
    };
  }
  
  export interface ApiResponse {
    response: {
      success: {
        data: ResponseData;
      };
    };
  }
  