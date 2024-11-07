import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchShopperAddressBook = async (
    shopperId: string
): Promise<any> => {
    try {
        const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${API_KEY}`;
        const addressBookResponse = await axiosInstance(shopperAddressBookApiEndpoint).get("");
        return addressBookResponse.data;
    } catch (error) {
        console.error(`Error getting address book for shopper: ${shopperId}`, error);
        throw error;
    }
};

export const createShopperAddressBookEntry = async (
    shopperId: string,
    addressData: object
): Promise<any> => {
    try {
        const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${API_KEY}`;
        const response = await axiosInstance(shopperAddressBookApiEndpoint).post("", addressData)
        return response.data;
    } catch (error) {
        console.error(`Error creating address book entry for shopper: ${shopperId}`, error);
        throw error;
    }
};