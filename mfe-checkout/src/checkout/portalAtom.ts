import { atom } from "jotai";
import {atomFamily} from "jotai/utils";
import {Portal} from "../interfaces/Portal";
import {fetchPortalData} from "../api/service/Portal";

type PortalApiKey = {
    shopperId: string;
    portalId: string;
};

export const portalApiData = atomFamily((key: string) =>
    atom<Promise<Portal>>(async () => {
        const { shopperId, portalId }: PortalApiKey = JSON.parse(key);
        try {
            const data: Portal = await fetchPortalData(shopperId, portalId);
            return data;
        } catch (error) {
            console.error("Failed to fetch portal info:", error);
            throw new Error("Error fetching data");
        }
    })
);