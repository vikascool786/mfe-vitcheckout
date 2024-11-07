import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchSiteData = async (
    siteId: string
): Promise<any> => {
    try {
        const siteApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/site/v1/Site/${siteId}?api_key=${API_KEY}`;
        const siteResponse = await axiosInstance(siteApiEndpoint).get("");
        return siteResponse.data;
    } catch (error) {
        console.error(`Error getting site info for siteId: ${siteId}`, error);
    }
};