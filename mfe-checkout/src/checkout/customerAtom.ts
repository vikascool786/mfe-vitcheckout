import {atomFamily, atomWithDefault} from "jotai/utils";
import {fetchCustomerProfileData} from "../api/service/CustomerProfile";
import {CustomerProfile} from "../interfaces/CustomerProfile";
import {atom} from "jotai/index";
import {fetchShopperDetail} from "../api/service/ShopperDetail";

export const customerApiData = atomFamily((pcid: string) =>
    atom<Promise<CustomerProfile | null>>(async () => {
        if (!pcid) {
            return null;
        }
        try {
            const data: CustomerProfile = await fetchCustomerProfileData(pcid);
            return data;
        } catch (error) {
            console.error("Failed to fetch customer info:", error);
            try {
                const shopperData = await fetchShopperDetail(pcid);
                return {
                    first_name: shopperData.firstName,
                    last_name: shopperData.lastName,
                    email_address: shopperData.email,
                } as CustomerProfile;
            } catch (error) {
                console.error("Failed to fetch shopper detail:", error);
                return null;
            }
        }
    })
);