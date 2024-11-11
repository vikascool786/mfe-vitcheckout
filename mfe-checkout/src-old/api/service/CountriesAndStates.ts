import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchStatesAndCountries = async (
    siteId: string
): Promise<any> => {
    try {
        const countriesApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/site/v1/Site/${siteId}/Countries?api_key=${API_KEY}`;
        const countriesResponse = await axiosInstance(countriesApiEndpoint).get("");
        const countryId = countriesResponse.data[0].taxRegionID;

        const statesApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/site/v1/Site/${countryId}/States?api_key=${API_KEY}`
        const stateResponse = await axiosInstance(statesApiEndpoint).get("");

        return stateResponse.data;
    } catch (error) {
        console.error('Error during API calls:', error);
    }
};