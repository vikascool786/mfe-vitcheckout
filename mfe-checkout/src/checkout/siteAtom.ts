import { atom } from "jotai";
import {atomFamily} from "jotai/utils";
import {fetchSiteData} from "../api/service/Site";
import {Site} from "../interfaces/Site";

export const siteApiData = atomFamily((siteId: string) =>
    atom<Promise<Site>>(async () => {
        try {
            const data: Site = await fetchSiteData(siteId);
            return data;
        } catch (error) {
            console.error("Failed to fetch site info:", error);
            throw new Error("Error fetching data");
        }
    })
);