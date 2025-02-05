import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const fetchPortalData = async (
    shopperId: string
): Promise<any> => {
    try {
        const siteApiEndpoint = `${apiDomain}/micro-shopper-portal/v1/Portal/Shopper/${shopperId}?api_key=${apiKey}`;
        const siteResponse = await axiosInstance(siteApiEndpoint).get("");
        return siteResponse.data;
    } catch (error) {
        console.error(`Error getting portal info for shopperId: ${shopperId}`, error);
    }
};