import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";
import {Item} from "../../interfaces/Order";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const doShippingCalc = async (
    portalId: string,
    items: Item[],
): Promise<any> => {
    //filter out BO/PreOrder items
    const inStockItems = items.filter(item =>
        item?.permutation?.inventoryStatus !== "TEMPORARILY_OUT_OF_STOCK" &&
        item?.permutation?.inventoryStatus !== "PRE_ORDER"
    );

    if(inStockItems.length > 0){
        try {
            const postData = new URLSearchParams();
            inStockItems.forEach(item => {
                postData.append("merchantSKUs", String(item.catalogSku));
                postData.append("quantity", String(item.quantity));
                postData.append("autoship", String(item.autoshipFreq));
                postData.append("prodID", String(item.prodId));
            });
            postData.append("portal", portalId);

            const shippingCalcEndpoint = `${apiDomain}/shoppingcart-shippingcalcs/v1/Shipping/Products?api_key=${apiKey}`;
            const shippingCalcResponse = await axiosInstance(shippingCalcEndpoint).post("", postData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            return shippingCalcResponse.data;
        } catch (error) {
            console.error(`Error calculating shipping`, error);
        }
    }
};