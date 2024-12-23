import { useEffect, useState } from "react";
import { Address } from "../../interfaces/Address";
import { EWallet } from "../../interfaces/EWallet";
import { GET_API_KEY, GET_API_ENDPOINT_BASE_URL_ONLY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();


const shopperWalletApiEndpoint = (id: string) =>
  `${apiDomain}/shopper-wallets/v1/Shopper/${id}/Wallet/Addresses?api_key=${apiKey}`;

export const useShopperEWallet = (customerId: string) => {
  const [eWalletData, setEWalletData] = useState<EWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShopperEWallet = async () => {
      try {
        setLoading(true);
        const shopperEWalletApiEndpoint = `${apiDomain}/ewallet/v1/customer/${customerId}?merchCountry=USA&langCode=ENG&siteId=222&siteCountry=USA&siteType=SHP&api_key=${apiKey}`;
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
        // const addressApiEndpoint = `${apiDomain}/Shopper/${customerId}/Wallet/Addresses?siteId=222&api_key=${apiKey}`;
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
