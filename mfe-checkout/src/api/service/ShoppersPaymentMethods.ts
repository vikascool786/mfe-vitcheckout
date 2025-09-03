import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import { API_KEY } from "../../utils/ApiConstants";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
  GET_TOKEN_SERVICE,
  GET_TOKEN_SERVICE_SHOP,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";

const shopperWalletApiEndpoint = (id: string) =>
  `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-wallets/v1/Shopper/${id}/Wallet?api_key=${GET_API_KEY()}`;

export const fetchShoppersPaymentMethods = async (
  shopperId: string
): Promise<IPaymentMethod[]> => {
  try {
    const walletResponse = await axiosInstance(
      shopperWalletApiEndpoint(shopperId)
    ).get("");
    return walletResponse.data;
  } catch (error) {
    console.error(
      `Error getting wallet payment methods for shopper: ${shopperId}`,
      error
    );
    throw error;
  }
};

export const fetchShoppersPaymentAddresses = async (
  shopperId: string
): Promise<any> => {
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-wallets/v1/Shopper/${shopperId}/Addresses?api_key=${GET_API_KEY()}`
    ).get("");
    return response.data;
  } catch (error) {
    console.error("Unable to fetch payment addresses", error);
  }
};

export const addShoppersPaymentMethod = async (
  shopperId: string,
  walletData: any
): Promise<IPaymentMethod[]> => {
  const response = await axiosInstance(
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${GET_API_KEY()}`
  ).post("", walletData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const addTempPaymentMethod = async (
  shopperId: string,
  walletData: any
): Promise<IPaymentMethod> => {
  const response = await axiosInstance(
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperId}?api_key=${GET_API_KEY()}`
  ).post("", walletData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export const updateTempPaymentMethod = async (
  shopperId: string,
  walletData: any
): Promise<IPaymentMethod | undefined> => {
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperId}?api_key=${GET_API_KEY()}`
    ).put("", walletData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Unable to add method to wallet", error);
  }
};

export const updateShopperDetails = async (
  shopperId: string,
  id: number,
  walletData: any
) => {
  const response = await axiosInstance(
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-wallets/v1/Shopper/${shopperId}/Wallet/${id}?api_key=${GET_API_KEY()}`
  ).put("", walletData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response;
};

export const saveCvv = async (
    shopperId: string,
    id: number,
    cvv: string
) => {
  const walletData = {
    cvv: cvv
  }
  return updateShopperDetails(shopperId, id, walletData);
};

export const generateCardToken = async (ccNumber: string) => {
  const data = `ccNumber=${ccNumber}`;
  try {
    const response = await axiosInstance(`${GET_TOKEN_SERVICE_SHOP()}`).post(
      "",
      data,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Unable to update payment details", error);
  }
};

export const generateCardExistingToken = async (
  data: string,
  shopperId: string,
  paymentId: number
) => {
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY}/shopper-wallets/v1/Shopper/${shopperId}/Wallet/${paymentId}?siteId=222&api_key=${API_KEY}`
    ).put("", data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response;
  } catch (error) {
    console.error("Unable to update payment details", error);
  }
};

export const generatePayPalTransactionDetails = async (
  shopperId: string,
  token: string,
  hideShipping: boolean,
  isRecurring: boolean
) => {
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/Paypal/${shopperId}/Token/${token}?api_key=${GET_API_KEY()}&hideShipping=${hideShipping}&isRecurring=${isRecurring}`
    ).get("");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
