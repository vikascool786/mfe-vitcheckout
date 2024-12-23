import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

const fetchCountryId = async (siteId: string) => {
    const countriesApiEndpoint = `${apiDomain}/site/v1/Site/${siteId}/Countries?api_key=${apiKey}`

    const countryId = await axiosInstance(countriesApiEndpoint).get("").then(res => {
        const { data } = res;
        return data[0].taxRegionID;
    });
    return countryId;
}

const fetchStates = async (countryId: string) => {
    const statesApiEndpoint = `${apiDomain}/site/v1/Site/${countryId}/States?api_key=${apiKey}`

    return await axiosInstance(statesApiEndpoint).get("").then(res => {
        return res.data;
    });
}

export const fetchStatesAndCountries = async (
    siteId: string
): Promise<any> => {
    try {
        const countryId = await fetchCountryId(siteId);
        return await fetchStates(countryId);
    } catch (error) {
        console.error('Error during API calls:', error);
    }
};