import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import { API_KEY } from "../../utils/ApiConstants";
import {
  GET_API_KEY,
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_TOKEN_SERVICE,
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

export const addShoppersPaymentMethod = async (
  shopperId: string,
  walletData: any
): Promise<IPaymentMethod[]> => {
  try {
    const response = await axiosInstance(
      `https://devapi2.shop.com/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=c7f5de6a77644516b24c68fc4ac173fc`
    ).post("", walletData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // console.log("Card added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Unable to add method to wallet", error);
  }
  return [];
};

export const addTempPaymentMethod = async (
  shopperId: string,
  walletData: any
): Promise<IPaymentMethod | undefined> => {
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperId}?api_key=${GET_API_KEY()}`
    ).post("", walletData, {
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
  try {
    const response = await axiosInstance(
      `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-wallets/v1/Shopper/${shopperId}/Wallet/${id}?api_key=${GET_API_KEY()}`
    ).put("", walletData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response;
  } catch (error) {
    console.error("Unable to update payment details", error);
  }
};

export const generateCardToken = async (ccNumber: string) => {
  try {
    const response = await axiosInstance(
      `${GET_TOKEN_SERVICE()}?ccNum=${ccNumber}`
    ).get("");
    return response;
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
      `https://devapi2.shop.com/shopper-wallets/v1/Shopper/${shopperId}/Wallet/${paymentId}?siteId=222&api_key=${API_KEY}`
    ).put("", data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response;
  } catch (error) {
    console.error("Unable to update payment details", error);
  }
};
