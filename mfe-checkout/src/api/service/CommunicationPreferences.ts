import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";
import {Site} from "../../interfaces/Site";
import {ShopperCommunicationPreferences} from "../../interfaces/ShopperCommunicationPreferences";

export const fetchCustomerPreferenceData = async (
    pcid: string,
    siteData: Site
): Promise<ShopperCommunicationPreferences> => {
    try {
        const commPreferenceEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/micro-communication-preference/v1/Shopper/CommunicationPreference/${pcid}?country=${siteData.siteCountryCode}&language=${siteData.locale.maLanguageCode}&siteType=SHP&api_key=${GET_API_KEY()}`;
        const preferenceResponse = await axiosInstance(commPreferenceEndpoint).get("");
        return preferenceResponse.data;
    } catch (error) {
        console.error(`Error getting communication preferences for pcid: ${pcid}`, error);
        return {preferences: []};
    }
};