import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const getTransactionData = async (
    flowId: string,
    transId: string,
    total: string,
): Promise<any> => {
    try {
        const c2pTransactionApiEndpoint =
            `${GET_API_ENDPOINT_BASE_URL}/shoppingcart-checkouts/v1/Checkout/ShoppingCart/MasterPass/C2P/Flow/${flowId}/Transaction/${transId}/total/${total}?api_key=${API_KEY}`;
        return await axiosInstance(c2pTransactionApiEndpoint).get("");
    } catch (error) {
        console.error('Error getting transaction data for click2pay:', error);
    }
};