
import axiosInstance from "../axios";
import {GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY} from "../../utils/urlResolver";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const getTransactionData = async (
    flowId: string,
    transId: string,
    total: string,
): Promise<any> => {
    try {
        const c2pTransactionApiEndpoint =
            `${apiDomain}/shoppingcart-checkouts/v1/Checkout/ShoppingCart/MasterPass/C2P/Flow/${flowId}/Transaction/${transId}/total/${total}?api_key=${apiKey}`;
        return await axiosInstance(c2pTransactionApiEndpoint).get("");
    } catch (error) {
        console.error('Error getting transaction data for click2pay:', error);
    }
};