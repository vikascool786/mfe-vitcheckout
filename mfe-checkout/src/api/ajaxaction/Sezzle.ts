import { GET_AJAX_ENDPOINT_BASE_URL } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const fetchSezzleUrl = async (
    total: string,
    tempOrderId: string,
): Promise<any> => {
    try {
        const FAMOS_SEZZLE_URL_PATH = `/ajaxaction/get-sezzle-data?isGuest=false&total=${total}&tempOrderId=${tempOrderId}`;
        const ajaxEndpoint = `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", FAMOS_SEZZLE_URL_PATH);
        const ajaxResponse = await axiosInstance(ajaxEndpoint).get("");
        return ajaxResponse.data;
    } catch (error) {
        console.error(`Error getting sezzle url`, error);
    }
};

export const checkoutSezzle = async (
): Promise<any> => {
    try {
        const FAMOS_SEZZLE_CHECKOUT_PATH = `/ajaxaction/checkout-sezzle`;
        const ajaxEndpoint = `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", FAMOS_SEZZLE_CHECKOUT_PATH);
        const ajaxResponse = await axiosInstance(ajaxEndpoint).get("");
        return ajaxResponse.data;
    } catch (error) {
        console.error(`Error checking out with sezzle`, error);
    }
};