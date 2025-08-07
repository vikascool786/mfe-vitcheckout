import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const fetchShopperDirectory = async (
    email: string
): Promise<any> => {
    try {
        const shopperDirectoryEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-directory/v1/${email}?api_key=${GET_API_KEY()}`;
        const directoryResponse = await axiosInstance(shopperDirectoryEndpoint).get("");
        return directoryResponse.data;
    } catch (error) {
        console.error(`Error getting shopper directory info for email: ${email}`, error);
        return {};
    }
};