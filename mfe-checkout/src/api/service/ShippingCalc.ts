import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";
import {Item} from "../../interfaces/Order";
import {isCustomCocktail, isInStockItem} from "../../utils/ItemUtils";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

/**
 * This service was used to calculate free ship messages and get ship promos by store
 * Intended for outside of checkout - should no longer need to use this service, free ship details should now come from universal order
 * see AI-111313 and AI-111322
 * @param portalId
 * @param items
 */
export const doShippingCalc = async (
    portalId: string,
    items: Item[],
): Promise<any> => {
    //filter out BO/PreOrder items and custom cocktail
    const qualifiedItems = items.filter(item =>
        isInStockItem(item) && !isCustomCocktail(item)
    );

    if(qualifiedItems.length > 0){
        try {
            const postData = new URLSearchParams();
            qualifiedItems.forEach(item => {
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