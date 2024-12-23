import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const fetchSiteData = async (
    siteId: string
): Promise<any> => {
    try {
        const siteApiEndpoint = `${apiDomain}/site/v1/Site/${siteId}?api_key=${apiKey}`;
        const siteResponse = await axiosInstance(siteApiEndpoint).get("");
        return siteResponse.data;
    } catch (error) {
        console.error(`Error getting site info for siteId: ${siteId}`, error);
    }
};