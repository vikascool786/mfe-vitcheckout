import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { IShopperCart, IShopperChangeCart } from "../../interfaces/ShopperCart";
import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";

interface UseGetShopperCartResult {
  data: IShopperCart | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseUpdateShopperCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateCart: (payload: IShopperChangeCart) => Promise<void>;
}
PageTransitionEvent;

export const SHOPPER_CART = {
  stores: {
    "108567": {
      quantity: 1,
      totals: {
        cashBack: 2.94,
        ibvOnlyCampaign: 6.47,
        bv: 0.0,
        price: 48.99,
        ibvStandardCampaign: 1.96,
        ibv: 1.96,
        ibvStandard: 1.96,
        ibvOnly: 6.47,
        vat: 0.0,
        customerIncentivePoints: 0.0,
      },
      items: [
        {
          prodId: "1825001247",
          volumeID: 259190,
          prodContainerId: 1855205799,
          productType: "ONE",
          opContainerId: 1587999423,
          weight: 0.45,
          image: {
            url: "https://img.mashop.com/Image/250000/259100/259190/products/1855205799.jpg?size=100x100",
          },
          limitShippingMethodIDs: [],
          storeMaVendorId: "1887",
          caption:
            "Sonic the Hedgehog Red Running Shoes Plush Cosplay Slippers | One Size",
          catalogSku: "GEE-74771-C",
          product: {
            caption:
              "Sonic the Hedgehog Red Running Shoes Plush Cosplay Slippers | One Size",
            image: {
              url: "https://img.mashop.com/Image/250000/259100/259190/products/1855205799.jpg?size=100x100",
            },
            maxOrderQuantity: 0,
            volumeID: 259190,
            autoShipEnabled: false,
            prodContainerId: 1855205799,
            limitShippingMethodIDs: [],
            productType: "ONE",
            catalogSku: "GEE-74771-C",
            weight: 0.45,
            storeMaVendorId: "1887",
            priceInfo: {
              bv: 0.0,
              cashBack: 2.9394,
              ibvOnlyCampaign: 6.4667,
              actualPrice: 48.99,
              ibvStandardCampaign: 1.9596,
              ibv: 1.9596,
              ibvStandard: 1.9596,
              ibvOnly: 6.4667,
              onSale: false,
              salePrice: 0.0,
              customerIncentivePoints: 0.0,
              mipAmount: 0.0,
              standardCashBackPercent: 6.0,
              increasedCashBackPercent: 0.0,
            },
            totals: {
              cashBack: 2.94,
              ibvOnlyCampaign: 6.47,
              bv: 0.0,
              price: 48.99,
              ibvStandardCampaign: 1.96,
              ibv: 1.96,
              ibvStandard: 1.96,
              ibvOnly: 6.47,
              quantity: 1,
              vat: 0.0,
              customerIncentivePoints: 0.0,
            },
            catalogName: "Toynk",
            id: "1825001247",
            date_added: 1731846360827,
            date_modified: 1731846360827,
            quantity: 1,
            original_quantity: 1,
            product_hash:
              "d7508660c87a068bc8fc6ca6d7a8b64bcf5cdef8af6b9c878a5d153a426eb7bc",
            type: "ONE",
            special_formula: "0",
            option: [],
            userOptions: {
              httpref: "/cart-universal/v2/carts",
              option: [],
            },
            hasAutoShipDiscount: true,
          },
          store: {
            catalogName: "Toynk",
            catalogId: 108567,
          },
        },
      ],
    },
  },
  paymentMethods: [
    {
      typeID: 1,
      type: "American Express",
      categoryID: 1,
      visible: true,
      supportedForAutoship: true,
      imageTag: "^imageserver/local/images/cc/amex.svg",
    },
    {
      typeID: 60,
      type: "C2P",
      categoryID: 1,
      visible: false,
      supportedForAutoship: true,
      imageTag: "^imageserver/local/images/cc/c2p.svg",
    },
    {
      typeID: 6,
      type: "MasterCard",
      categoryID: 1,
      visible: true,
      supportedForAutoship: true,
      imageTag: "^imageserver/local/images/cc/mastercard.svg",
    },
    {
      typeID: 9,
      type: "Visa",
      categoryID: 1,
      visible: true,
      supportedForAutoship: true,
      imageTag: "^imageserver/local/images/cc/visa.svg",
    },
    {
      typeID: 31,
      type: "PayPal",
      categoryID: 7,
      visible: false,
      imageTag: "^imageserver/local/images/cc/paypal.svg",
    },
    {
      typeID: 48,
      type: "Paypal Auth",
      categoryID: 7,
      visible: false,
      imageTag: "^imageserver/local/images/cc/paypal.svg",
    },
    {
      typeID: 49,
      type: "Paypal Credit",
      categoryID: 7,
      visible: false,
      imageTag: "^imageserver/local/images/cc/ppc-acceptance-small.svg",
    },
    {
      typeID: 58,
      type: "Paypal Recurring",
      categoryID: 7,
      visible: false,
      supportedForAutoship: true,
      imageTag: "^imageserver/local/images/cc/paypal.svg",
    },
  ],
  quantity: 1,
  totals: {
    cashBack: 2.94,
    ibvOnlyCampaign: 6.47,
    bv: 0.0,
    price: 48.99,
    ibvStandardCampaign: 1.96,
    ibv: 1.96,
    ibvStandard: 1.96,
    ibvOnly: 6.47,
    vat: 0.0,
    customerIncentivePoints: 0.0,
  },
  id: "cart_1584076546_W_USA_USA_ENG",
};

export const useGetShopperCart = (
  cartId: string,
  siteId: string
): UseGetShopperCartResult => {
  const [data, setData] = useState<IShopperCart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShopperCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${GET_API_KEY()}/cart-universal/v2/carts/id/${cartId}?siteId=${siteId}`
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch shopper cart");
    } finally {
      setLoading(false);
    }
  }, [cartId, siteId]);

  useEffect(() => {
    fetchShopperCart();
  }, [fetchShopperCart]);

  return {
    data,
    loading,
    error,
    refetch: fetchShopperCart,
  };
};

export const useUpdateShopperCart = (
  cartId: string
): UseUpdateShopperCartResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const updateCart = useCallback(async (payload: IShopperChangeCart) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.put(
        `${GET_API_ENDPOINT_BASE_URL_ONLY()}/checkout-universal/v1/checkouts/id/${cartId}&api_key=${GET_API_KEY()}`,
        payload
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update shopper cart");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    success,
    updateCart,
  };
};
