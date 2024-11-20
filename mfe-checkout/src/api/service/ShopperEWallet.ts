import { useEffect, useState } from "react";
import { Address } from "../../interfaces/Address";
import { EWallet } from "../../interfaces/EWallet";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

const shopperWalletApiEndpoint = (id: string) =>
  `${GET_API_ENDPOINT_BASE_URL}/shopper-wallets/v1/Shopper/${id}/Wallet/Addresses?api_key=${API_KEY}`;

export const useShopperEWallet = (customerId: string) => {
  const [eWalletData, setEWalletData] = useState<EWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShopperEWallet = async () => {
      try {
        setLoading(true);
        const shopperEWalletApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/ewallet/v1/customer/${customerId}?merchCountry=USA&langCode=ENG&siteId=222&siteCountry=USA&siteType=SHP&api_key=${API_KEY}`;
        const { data: eWalletResponse } = await axiosInstance(
          shopperEWalletApiEndpoint
        ).get("");
        setEWalletData(eWalletResponse.data);
      } catch (error) {
        console.error(
          `Error fetching e-wallet data for shopper: ${customerId}`,
          error
        );
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchShopperEWallet();
    }
  }, [customerId]);

  return { eWalletData, loading, error };
};

export const useShopperEWalletAddresses = (customerId: string) => {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShopperAddresses = async () => {
      try {
        setLoading(true);
        // const addressApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/Shopper/${customerId}/Wallet/Addresses?siteId=222&api_key=${API_KEY}`;
        const { data: addressResponse } = await axiosInstance(
          shopperWalletApiEndpoint(customerId)
        ).get("");
        setAddresses(addressResponse);
      } catch (error) {
        console.error(
          `Error fetching shopper addresses for customer ID: ${customerId}`,
          error
        );
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchShopperAddresses();
    }
  }, [customerId]);

  return { addresses, loading, error };
};
