import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const fetchSiteFlagData = async (
    siteId: string,
    flagList: string
): Promise<any> => {
    try {
        const siteFlagApiEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/site/v1/Site/Flags?flags=${flagList}&siteId=${siteId}&api_key=${GET_API_KEY()}`;
        const siteResponse = await axiosInstance(siteFlagApiEndpoint).get("");
        return siteResponse.data;
    } catch (error) {
        console.error(`Error getting site info for siteId: ${flagList}`, error);
    }
};