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
    isSelected: true,
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

export const orderAtom = atom<Order>({
  orderId: -1,
  email: "robtest_us@yahoo.com",
  shippingAddress: {
    id: 36319888,
    description: "Automation, Test, Monterey",
    first: "Test",
    last: "Automation",
    address1: "1 Do Not Ship&amp;#39;s Rd.",
    address2: "",
    address3: "",
    address4: "",
    address5: "",
    address6: "",
    address7: "",
    city: "Monterey",
    state: "CA",
    country: "United States",
    isoalpha3Code: "USA",
    region: "",
    zip: "93940",
    phone: "1112223333",
    isPoBox: false,
  },
  billingAddress: {
    id: 30635502,
    description: "Snyder, Robby, Monterey",
    first: "Robby",
    last: "Snyder",
    address1: "1 Lower Ragsdale Rd.",
    address2: "",
    address3: "",
    address4: "",
    address5: "",
    address6: "",
    address7: "",
    city: "Monterey",
    state: "CA",
    country: "United States",
    isoalpha3Code: "USA",
    region: "",
    zip: "93940",
    phone: "8313450291",
    isPoBox: false,
  },
  paymentMethod: {
    id: 0,
    number: "",
    cvv: "",
    type: "",
    html: "",
    token: "",
    accountName: "",
    mask: "",
    expMonth: 0,
    expYear: 0,
    typeID: 0,
  },
  id: "cart_1918885741_W_USA_USA_ENG",
  stores: {
    "2517": {
      store: {
        isMA: 0,
        catalogName: "Rastelli's",
        catalogId: 122194,
        marketFacilitator: 1,
      },
      totals: {
        price: 2719.84,
        tax: 0,
        cashBack: 61.2,
        bv: 0,
        ibv: 0,
        shipping: 0,
        priceStr: "$2,719.84",
        shippingStr: "$0.00",
        taxStr: "$0.00",
        cashBackStr: "$61.20",
      },
      items: [
        {
          prodId: 1956360776,
          catalogSku: "MA54VP1",
          image: {
            url: "https://img.shop.com/Image/270000/274300/274355/products/1986566422.jpg?size=100x100",
          },
          caption: "Rastelli's Faroe Island Salmon Fillets 6 oz. Portions",
          quantity: 4,
          option: [
            {
              optionStringValue:
                "(20 Count) Rastelli's Faroe Island Salmon Fillets 6 oz. Portions 7.5 lbs",
              name: "Pack Size",
            },
          ],
          product_hash:
            "5db64fa3fdd4d5a8e9f7da67794d7a05365b99b7d9660310c633ba8ca7b1580b",
          available: "0",
          hasAutoShipDiscount: false,
          autoshipFreq: 0,
          totals: {
            price: 2719.84,
            tax: 0,
            taxPct: 0,
            cashBack: 61.2,
            bv: 0,
            ibv: 0,
            priceStr: "$2,719.84",
            taxStr: "$0.00",
            cashBackStr: "$61.20",
          },
          catalogName: "Rastelli's",
          storeMaVendorId: "2517",
          permutation: {
            inventoryStatus: "IN_STOCK",
          },
          prodContainerId: "1986566422",
        },
      ],
      shippingMethod: "Standard",
      deliveryMessage: "Mar. 11 - Mar. 13",
      shippingSelections: [
        {
          id: 1,
          method: "Standard",
          total: 0,
          estShipDate: "Mar. 11 - Mar. 13",
          totalStr: "$0.00",
        },
      ],
      shipping: {
        id: 1,
        method: "Standard",
        total: 0,
        estShipDate: "Mar. 11 - Mar. 13",
        totalStr: "$0.00",
      },
      canConsolidate: false,
    },
  },
  userOptions: {
    applyCashback: false,
    applyEWallet: false,
    oosConsolidate: 3,
    gcNum: [],
    gcPin: [],
    coupons: [],
    tempOrderID: "12707290",
    allowOOSConsolidate: 2,
  },
  paymentMethods: [
    {
      typeID: 56,
      type: "Sezzle",
      imageTag: "^imageserver/local/images/cc/Sezzle_Logo_FullColor-small.png",
      supportedForAutoship: false,
      visible: false,
    },
    {
      typeID: 57,
      type: "BitPay",
      imageTag:
        "https://bitpay.com/cdn/merchant-resources/bitpay-accepted-card-group.svg",
      supportedForAutoship: false,
      visible: false,
    },
    {
      typeID: 31,
      type: "PayPal",
      imageTag: "^imageserver/local/images/cc/paypal.jpg",
      visible: false,
    },
    {
      typeID: 49,
      type: "Paypal Credit",
      imageTag: "^imageserver/local/images/cc/ppc-acceptance-small.png",
      visible: false,
    },
    {
      typeID: 41,
      type: "MA Cashback",
      visible: false,
    },
    {
      typeID: 60,
      type: "C2P",
      supportedForAutoship: true,
      visible: false,
    },
    {
      typeID: 9,
      type: "Visa",
      imageTag: "^imageserver/local/images/cc/visa.jpg",
      supportedForAutoship: true,
      visible: true,
    },
    {
      typeID: 6,
      type: "MasterCard",
      imageTag: "^imageserver/local/images/cc/mastercard.png",
      supportedForAutoship: true,
      visible: true,
    },
  ],
  totals: {
    cashBack: 61.2,
    bv: 0,
    ibv: 0,
    cashBackApplied: 0,
    walletApplied: 0,
    gcApplied: 0,
    extraCashBack: 0,
    price: 2719.84,
    shipping: 0,
    tax: 0,
    priceStr: "$2,719.84",
    cashBackStr: "$61.20",
    taxStr: "$0.00",
    shippingStr: "$0.00",
    cashBackAppliedStr: "$0.00",
    walletAppliedStr: "$0.00",
    gcAppliedStr: "$0.00",
    couponsStr: "$0.00",
  },
});

export const addressAtom = atom<Address[]>([]);

export const paymentMethodsAtom = atom<IPaymentOption[]>(initialPaymentMethods);

export const OrderStore = createStore();

export const loadingAtom = atom<boolean>(false);

export const orderNotificationsAtom = atom<string[]>();
