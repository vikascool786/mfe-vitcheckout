import { useState, useCallback } from "react";
import {
  GET_API_KEY,
  GET_API_ENDPOINT_BASE_URL_ONLY,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

// Hook for fetching the shopper's address book
export const useFetchShopperAddressBook = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShopperAddressBook = useCallback(async (shopperId: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${apiKey}`;
      const response = await axiosInstance(endpoint).get("");
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error(
        `Error fetching address book for shopper: ${shopperId}`,
        err
      );
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchShopperAddressBook };
};

// Hook for creating a new address book entry
export const useCreateShopperAddressBookEntry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createShopperAddressBookEntry = useCallback(
    async (shopperId: string, addressData: string) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook?api_key=${apiKey}`;
        const response = await axiosInstance(endpoint).post("", addressData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
      } catch (err) {
        console.error(
          `Error creating address book entry for shopper: ${shopperId}`,
          err
        );
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, createShopperAddressBookEntry };
};

// Hook for updating an address book entry
export const useUpdateShopperAddressBookEntry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateShopperAddressBookEntry = useCallback(
    async (shopperId: string, addressId: number, addressData: string) => {
      setLoading(true);
      setError(null);
      const endpoint = `${apiDomain}/shopper-addressbooks/v1/${shopperId}/AddressBook/${addressId}?api_key=${apiKey}`;
      const response = await axiosInstance(endpoint).put("", addressData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    },
    []
  );

  return { loading, error, updateShopperAddressBookEntry };
};

// Hook for updating text updates for phone
export const useUpdateTextUpdatesForPhone = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTextUpdatesForPhone = useCallback(async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    const endpoint = `https://devapi2.shop.com/twilio/v1/lookups?type=carrier&to=${phoneNumber}&country=USA?api_key=${apiKey}`;
    try {
      const response = await axiosInstance(endpoint).get("");
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error(
        `Error updating text updates for phone: ${phoneNumber}`,
        err
      );
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, updateTextUpdatesForPhone };
};
