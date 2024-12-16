import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

const shopperWalletApiEndpoint = (id: string) =>
  `${GET_API_ENDPOINT_BASE_URL}/shopper-wallets/v1/Shopper/${id}/Wallet?api_key=${API_KEY}`;

export const fetchShoppersPaymentMethods = async (
  shopperId: string
): Promise<any> => {
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
): Promise<any> => {
  try {
    const response = await axiosInstance(
      `https://devapi2.shop.com/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=c7f5de6a77644516b24c68fc4ac173fc`
    ).post("", walletData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Card added successfully:", response.data);
  } catch (error) {
    console.error("Unable to add method to wallet", error);
  }
};

export const addTempPaymentMethod = async (
    shopperId: string,
    walletData: any
): Promise<any> => {
  try {
    const response = await axiosInstance(
        `${GET_API_ENDPOINT_BASE_URL}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperId}?api_key=${API_KEY}`
    ).post("", walletData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response;
  } catch (error) {
    console.error("Unable to add method to wallet", error);
  }
};

