import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";
import {Site} from "../../interfaces/Site";

export const fetchTwilioLookupData = async (
    phoneNumber: string,
    siteData: Site
): Promise<any> => {
    try {
        const twilioLookupEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/twilio/v1/lookups?type=carrier&to=${phoneNumber}&country=${siteData.siteCountryCode}&api_key=${GET_API_KEY()}`;
        const lookupResponse = await axiosInstance(twilioLookupEndpoint).get("");
        return lookupResponse.data;
    } catch (error) {
        console.error(`Error doing twilio phone lookup: ${phoneNumber}`, error);
        return null;
    }
};

export const PHONE_TYPE_MOBILE = "mobile";