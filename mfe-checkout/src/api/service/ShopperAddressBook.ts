import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchShopperAddressBook = async (
  shopperId: string
): Promise<any> => {
  try {
    const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${API_KEY}`;
    const addressBookResponse = await axiosInstance(
      shopperAddressBookApiEndpoint
    ).get("");
    return addressBookResponse.data;
  } catch (error) {
    console.error(
      `Error getting address book for shopper: ${shopperId}`,
      error
    );
    throw error;
  }
};

export const createShopperAddressBookEntry = async (
  shopperId: string,
  addressData: string
): Promise<any> => {
  try {
    const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${API_KEY}`;
    const response = await axiosInstance(shopperAddressBookApiEndpoint).post(
      "",
      addressData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error creating address book entry for shopper: ${shopperId}`,
      error
    );
    throw error;
  }
};

export const updateShopperAddressBookEntry = async (
  shopperId: string,
  addressId: number,
  addressData: string
): Promise<any> => {
  try {
    const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/shopper-addressbooks/v1/${shopperId}/AddressBook/${addressId}?api_key=${API_KEY}`;
    const response = await axiosInstance(shopperAddressBookApiEndpoint).put(
      "",
      addressData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating address book entry for shopper: ${shopperId}`,
      error
    );
    throw error;
  }
};

export const updateTextUpdatesForPhone = async (phoneNumber: string) => {
  const endpoint = `https://devapi2.shop.com/twilio/v1/lookups?type=carrier&to=${phoneNumber}&country=USA?api_key=${API_KEY}`;
  try {
    const response = await axiosInstance(endpoint).get("");
    return response.data;
  } catch (error) {
    console.log("Error", error);
  }
};
