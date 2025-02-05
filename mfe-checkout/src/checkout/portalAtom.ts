import { atom } from "jotai";
import {atomFamily} from "jotai/utils";
import {Portal} from "../interfaces/Portal";
import {fetchPortalData} from "../api/service/Portal";

export const portalApiData = atomFamily((shopperId: string) =>
    atom<Promise<Portal>>(async () => {
        try {
            const data: Portal = await fetchPortalData(shopperId);
            return data;
        } catch (error) {
            console.error("Failed to fetch portal info:", error);
            throw new Error("Error fetching data");
        }
    })
);