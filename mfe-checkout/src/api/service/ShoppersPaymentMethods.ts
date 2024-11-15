import { ShopperSavedPayments } from "../../interfaces/ShopperSavedPayments";
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
    walletData: ShopperSavedPayments
): Promise<any> => {
    try {
        const addCard = await axiosInstance(
            shopperWalletApiEndpoint(shopperId)
        ).post("", walletData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
    } catch (error) {
        console.error("Unable to add method to wallet");
    }
};
