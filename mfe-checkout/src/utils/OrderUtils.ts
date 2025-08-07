import { ChangeOrder } from "../interfaces/ChangeOrder";
import { IUserOptions, Order } from "../interfaces/Order";
import {
    OOS_CONSOLIDATE_CODE,
    OOS_CONSOLIDATE_SPLIT_CODE,
    OrderConsolidationData
} from "../interfaces/OrderConsolidationData";
import { Success } from "../api/service/Order";
import { GIFT_CARD_STORE_CATALOGS, GIFT_CARD_STORE_VOLUMES, isGiftCardStore } from "./StoreUtils";
import { isAddressDefaultMAAddress } from "./AddressUtils";
import { Options, ShoppingCart } from "../interfaces/ShoppingCart";
import { Address } from "../interfaces/Address";
import { IPaymentMethod, ITotal } from "../interfaces/ShopperCart";

const ORDER_APPLICATION_TYPE_CART = "CART";

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

export const orderHasDefaultMAShipAddress = (order: Order | null): boolean => {
    if (!order) return false;
    return isAddressDefaultMAAddress(order.shippingAddress);
};

export const getOrderConsolidateData = (
    order: Order | null,
    getString:any
): OrderConsolidationData => {
    let orderConsolidateData = {
        showOrderConsolidate: false,
        availabilityDate: "",
        oosConsolidate: OOS_CONSOLIDATE_CODE,
        shipDateMessageMap: new Map<string, string>(),
    };
    if (!order) return orderConsolidateData;
    let availabilityDates: string[] = [];
    let availabilityDisplayDates: string[] = [];
    let canConsolidate = Object.values(order.stores).filter(
        (store) => store.canConsolidate
    );
    const maProductCount = Object.values(order.stores)
        .filter((entry) => entry.store?.isMA === 1 && !isGiftCardStore(entry))
        .reduce((count, entry) => count + entry.items.length, 0);
    orderConsolidateData.showOrderConsolidate =
        canConsolidate.length > 0 && maProductCount > 1;
    if (orderConsolidateData.showOrderConsolidate) {
        Object.values(order.stores).forEach((value) => {
            value.items.forEach((i) => {
                if (i?.availableDisplayDate !== "0") {
                    if (i?.availableDisplayDate != null) {
                        availabilityDisplayDates.push(i.availableDisplayDate);
                        availabilityDates.push(i.availableDisplayDate);
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
        const latestDateIndex = dateObjects.findIndex(
            (date) => date.getTime() === latestDate.getTime()
        );
        orderConsolidateData.availabilityDate = availabilityDisplayDates[latestDateIndex] || "";
    }
    if (orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE) {
        Object.entries(order.stores).forEach(([key, value]) => {
            const dateAvailable = value.items?.[0]?.available || "";
            orderConsolidateData.shipDateMessageMap.set(
                key,
                `${getString("shippingOn")} ${dateAvailable}`
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

export const orderHasShippingAddress = (order: Order | undefined): boolean => {
    return !!order?.shippingAddress?.address1?.length;
};

export const mapCartToOrder = (cart: ShoppingCart): Order => {
    const cartData = cart.shoppingCartData;
    const stores = cartData.storeData;

    const cartOrder = {
        applicationType: ORDER_APPLICATION_TYPE_CART,
        orderId: -1,
        id: cart.shoppingCartData.cartId || "",
        email: "",
        shippingAddress: {} as Address,
        billingAddress: {} as Address,
        paymentMethod: {} as IPaymentMethod,
        stores: {} as Order["stores"],
        totals: {} as ITotal,
        paymentMethods: [],
        userOptions: {} as IUserOptions,
    }

    if(stores){
        const mappedStores: Record<string, Order["stores"][string]> = {};

        for (const storeData of stores) {
            const storeId = storeData.storeVolumeId.toString();

            mappedStores[storeId] = {
                store: {
                    isMA: storeData.shippingData.maCatalog ? 1 : 0,
                    catalogName: storeData.storeName,
                    catalogId: parseInt(storeData.catalogId),
                },
                totals: {
                    price: storeData.totals.prices.priceValue,
                    cashBack: storeData.totals.rewards.cashbackValue,
                    bv: storeData.totals.rewards.bvValue,
                    ibv: storeData.totals.rewards.ibvValue,
                    priceStr: storeData.totals.prices.priceDisplay,
                    priceActual: storeData.totals.prices.priceValue.toString(),
                    priceActualStr: storeData.totals.prices.priceValue.toString(),
                    cashBackStr: storeData.totals.rewards.cashbackDisplay
                },
                shippingSelections: [],
                canConsolidate: false,
                items: storeData.items.map(item => ({
                    prodId: item.prodId.toString(),
                    catalogSku: item.catalogSku,
                    image: { url: item.imagePath },
                    caption: item.title,
                    specialFormula: item.special_formula,
                    quantity: item.quantity,
                    option: buildItemOptions(item.options),
                    product_hash: item.shoppingCartItemId,
                    available: "0",
                    autoshipFreq: item.userOptions.autoShipFrequency,
                    totals: {
                        price: item.totals.prices.priceValue,
                        cashBack: item.totals.rewards.cashbackValue,
                        bv: item.totals.rewards.bvValue,
                        ibv: item.totals.rewards.ibvValue,
                        actualPrice: item.totals.prices.priceValue,
                        priceStr: item.totals.prices.priceDisplay,
                        priceActualStr: item.totals.prices.priceValue.toString(),
                        cashBackStr: item.totals.rewards.cashbackDisplay
                    },
                    catalogName: storeData.storeName,
                    storeMaVendorId: storeId,
                    prodContainerId: item.prodcontainerId.toString(),
                    volumeId: storeData.storeVolumeId.toString()
                })),
            };
        }

        cartOrder.stores = mappedStores;
    }
    return cartOrder;
};

const buildItemOptions = (options: Options[]): any[] => {
    let optionList = [];
    optionList = options.map(option => ({
        name: option.promptDisplay,
        optionStringValue: option.value,
    }));
    return optionList;
};

//Check if the order has been built from cart data and not been built by universal checkout
export const isCartOrder = (order: Order): boolean => {
    const hasShipAddress = (order?.shippingAddress && Object.keys(order.shippingAddress).length > 0);
    const isCartApplicationType = order?.applicationType?.toUpperCase() === ORDER_APPLICATION_TYPE_CART;
    return !hasShipAddress && isCartApplicationType;
};

export const isUniversalOrderBuilt = (order: Order | undefined): boolean => {
    if (!order) return false;
    const hasShipAddress = (order?.shippingAddress && Object.keys(order.shippingAddress).length > 0);
    const isCartApplicationType = order?.applicationType?.toUpperCase() === ORDER_APPLICATION_TYPE_CART;
    return hasShipAddress && !isCartApplicationType;
};