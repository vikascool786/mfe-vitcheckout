import { ChangeOrder } from "../interfaces/ChangeOrder";
import { Order } from "../interfaces/Order";
import {
    OOS_CONSOLIDATE_CODE,
    OOS_CONSOLIDATE_SPLIT_CODE,
    OrderConsolidationData
} from "../interfaces/OrderConsolidationData";
import { Success } from "../api/service/Order";
import {GIFT_CARD_STORE_CATALOGS, GIFT_CARD_STORE_VOLUMES} from "./StoreUtils";

export function updatePaymentMethod(
    order: ChangeOrder,
    newPaymentMethodId: number
): ChangeOrder {
    return {
        ...order,
        paymentMethod: {
            ...order.paymentMethod,
            id: newPaymentMethodId,
        },
    };
}

export const formattedNumber = (num: any) => Number(num).toFixed(2);

export const orderHasAutoshipItems = (order: Order | null): boolean => {
    if (!order) return false;

    return Object.values(order.stores)
        .flatMap((store) => store.items)
        .some((item) => item.autoshipFreq > 0 || item.autoShipId !== undefined);
};

export const getOrderConsolidateData = (
    order: Order | null
): OrderConsolidationData => {
    let orderConsolidateData = {
        showOrderConsolidate: false,
        availabilityDate: "",
        oosConsolidate: OOS_CONSOLIDATE_CODE,
        shipDateMessageMap: new Map<string, string>(),
    };
    if (!order) return orderConsolidateData;
    let availabilityDates: string[] = [];
    let canConsolidate = Object.values(order.stores).filter(
        (store) => store.canConsolidate
    );
    const maProductCount = Object.values(order.stores)
        .filter((entry) => entry.store?.isMA === 1)
        .reduce((count, entry) => count + entry.items.length, 0);
    orderConsolidateData.showOrderConsolidate =
        canConsolidate.length > 0 && maProductCount > 1;
    if (orderConsolidateData.showOrderConsolidate) {
        Object.values(order.stores).forEach((value) => {
            value.items.forEach((i) => {
                if (i.available !== "0") {
                    if (i.available != null) {
                        availabilityDates.push(i.available);
                    }
                }
            });
        });
    }
    orderConsolidateData.oosConsolidate = order.userOptions.oosConsolidate;
    if (availabilityDates.length > 0) {
        const dateObjects = availabilityDates.map((date) => new Date(date));
        const latestDate = new Date(
            Math.max(...dateObjects.map((date) => date.getTime()))
        );
        orderConsolidateData.availabilityDate = latestDate.toLocaleDateString();
    }
    if (orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE) {
        Object.entries(order.stores).forEach(([key, value]) => {
            const dateAvailable = value.items?.[0]?.available || "";
            const shipStatusMessage =
                value.items?.[0]?.permutation?.inventoryStatus === "PRE_ORDER"
                    ? "Preorder"
                    : value.items?.[0]?.permutation?.inventoryStatus ===
                        "TEMPORARILY_OUT_OF_STOCK"
                        ? "Backordered"
                        : "";
            orderConsolidateData.shipDateMessageMap.set(
                key,
                `${shipStatusMessage} Shipping on ${dateAvailable}`
            );
        });
    }
    return orderConsolidateData;
};

export const getOrderNotifications = (
    orderSuccessResponse: Success | null
): string[] => {
    let orderNotifications: string[] = [];
    orderSuccessResponse?.notifications?.forEach((n) => {
        if (n.reason)   orderNotifications.push(n.reason);
    });
    return orderNotifications;
};

/**
 * Order only contains MA prods/stores
 * @param order
 */
export const orderIsMAOnly = (order: Order | null): boolean => {
    if (!order) return false;

    return Object.values(order.stores).every(store => store.store?.isMA === 1);
};

export const orderHasGiftCards = (order: Order | null): boolean => {
    if (!order) return false;
    const hasGCCatalogs = Object.values(order.stores).some(store =>
        GIFT_CARD_STORE_CATALOGS.includes(store.store?.catalogId));
    const hasGCVolumes = Object.values(order.stores).some(store =>
        store.items.some(item => GIFT_CARD_STORE_VOLUMES.includes(Number(item.volumeId)))
    );
    return hasGCCatalogs || hasGCVolumes;
};