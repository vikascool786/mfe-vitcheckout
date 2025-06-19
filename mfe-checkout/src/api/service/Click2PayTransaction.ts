
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
    } catch (error: any) {
        let errorMessage = 'Error getting transaction data for click2pay';
        if (error?.response?.data) {
            const data = error.response.data;
            if (typeof data === 'string') {
                errorMessage = data;
            } else if (typeof data === 'object' && data.error.message) {
                errorMessage = data.error.message;
            }
        }

        console.error('Error getting transaction data for click2pay:', errorMessage);
        throw new Error(errorMessage);
    }
};