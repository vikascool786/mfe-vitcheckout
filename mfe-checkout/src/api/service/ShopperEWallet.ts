import { useEffect, useState } from "react";
import { EWallet } from "../../interfaces/EWallet";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const useShopperEWallet = (customerId: string) => {
    const [eWalletData, setEWalletData] = useState<EWallet | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchShopperEWallet = async () => {
            try {
                setLoading(true);
                const shopperEWalletApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/ewallet/v1/customer/${customerId}/api_key=${API_KEY}&merchCountry=USA&langCode=ENG&siteId=222&siteCountry=SHP`;
                const eWalletResponse = await axiosInstance(
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
