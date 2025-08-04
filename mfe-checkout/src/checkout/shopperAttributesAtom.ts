import { atomFamily } from 'jotai/utils';
import { fetchShopperAttributes } from '../api/service/ShopperDetail';
import { atom } from "jotai";

export const shopperAttributesAtomFamily = atomFamily((shopperId: string) =>
    atom(async () => {
        if (!shopperId) return [];
        return await fetchShopperAttributes(shopperId);
    })
);