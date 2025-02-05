import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const fetchShopperDetail = async (
    pcid: string
): Promise<any> => {
    try {
        const customerProfileEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppers/v1/${pcid}?detail=true&api_key=${GET_API_KEY()}`;
        const customerResponse = await axiosInstance(customerProfileEndpoint).get("");
        return customerResponse.data;
    } catch (error) {
        console.error(`Error getting shopper detail info for pcid: ${pcid}`, error);
        throw new Error("Shopper detail not retrieved");
    }
};