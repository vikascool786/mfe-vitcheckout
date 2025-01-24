import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const fetchCustomerProfileData = async (
    pcid: string
): Promise<any> => {
    try {
        const siteFlagApiEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/customer-profile-alt-service/v1/profiles/customers/${pcid}?api_key=${GET_API_KEY()}`;
        const siteResponse = await axiosInstance(siteFlagApiEndpoint).get("");
        return siteResponse.data;
    } catch (error) {
        console.error(`Error getting customer profile info for pcid: ${pcid}`, error);
    }
};