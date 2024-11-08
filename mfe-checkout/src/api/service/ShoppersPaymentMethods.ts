import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchShoppersPaymentMethods = async (
    shopperId: string
): Promise<any> => {
    try {
        const shopperWalletApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-wallets/v1/Shopper/${shopperId}/Wallet?api_key=${API_KEY}`;
        const walletResponse = await axiosInstance(shopperWalletApiEndpoint).get("");
        return walletResponse.data;
    } catch (error) {
        console.error(`Error getting wallet payment methods for shopper: ${shopperId}`, error);
        throw error;
    }
};