import axiosInstance from "../axios";

const apiKey = "0cf27ca394e94667ad6729d427b700d4";
const devDomain = "http://devapi2.shop.com";

export const fetchStatesAndCountries = async (
    siteId: string
): Promise<any> => {
    try {
        const countriesApiEndpoint = `${devDomain}/site/v1/Site/${siteId}/Countries?api_key=${apiKey}`;
        const countriesResponse = await axiosInstance(countriesApiEndpoint).get("");
        const countryId = countriesResponse.data[0].taxRegionID;

        const statesApiEndpoint = `${devDomain}/site/v1/Site/${countryId}/States?api_key=${apiKey}`
        const stateResponse = await axiosInstance(statesApiEndpoint).get("");

        return stateResponse.data;
    } catch (error) {
        console.error('Error during API calls:', error);
    }
};