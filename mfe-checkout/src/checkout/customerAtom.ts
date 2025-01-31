import {atomFamily, atomWithDefault} from "jotai/utils";
import {fetchCustomerProfileData} from "../api/service/CustomerProfile";
import {CustomerProfile} from "../interfaces/CustomerProfile";

export const customerApiData = atomFamily((pcid: string) =>
    atomWithDefault<Promise<CustomerProfile | null>>(async () => {
        const maxRetries = 3;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    await delay(2000 * attempt);
                }
                const data: CustomerProfile = await fetchCustomerProfileData(pcid);
                return data;
            } catch (error) {
                console.error(`Attempt retrieving customer profile ${attempt} failed:`, error);
            }
        }
        return null;
    })
);