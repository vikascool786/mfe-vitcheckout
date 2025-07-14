import React, {useEffect, useState} from "react";
import {
    OOS_CONSOLIDATE_CODE,
    OOS_CONSOLIDATE_SPLIT_CODE,
    OrderConsolidationData
} from "../interfaces/OrderConsolidationData";
import {
    getOrderConsolidateData,
    orderHasGiftCards,
    orderIsMAOnly
} from "../utils/OrderUtils";
import { Order, OrderStore } from "../interfaces/Order";
import { getSortedStores, getStoreDataFromKey, isGiftCardForStoreKey } from "../utils/StoreUtils";
import { getItemEstimatedShipDate, hasEstimatedShipDate } from "../utils/ItemUtils";
import { useContentStrings } from "../hooks/useContentStrings";

interface IStoreHeadingProps {
    storeName: string;
    storeKey: string;
    isMAStore: boolean;
    order: Order;
    isOrderSummary: boolean;
    qaTag?: string;
}

const StoreHeading: React.FC<IStoreHeadingProps> = ({ storeName, storeKey, isMAStore, order, isOrderSummary, qaTag = "" }) => {
    const [showStoreShipmentHeading, setShowStoreShipmentHeading] = useState(false);
    const [orderConsolidateData, setOrderConsolidateData] =
        useState<OrderConsolidationData>({
            showOrderConsolidate: false,
            availabilityDate: "",
            oosConsolidate: OOS_CONSOLIDATE_CODE,
            shipDateMessageMap: new Map<string, string>(),
        });

    const { getString } = useContentStrings();

    const getMAOOSItemCountWithEstimatedShipDate = (order: Order, storeKey: string): number => {
        const store: OrderStore | null = getStoreDataFromKey(order, storeKey);
        if (!store || !store.items.length) return 0;
        return store.items.filter(item => hasEstimatedShipDate(item)).length;
    };

    const isOnlySingleMAOOSItemInStore = (order: Order, storeKey: string): boolean => {
        return getMAOOSItemCountWithEstimatedShipDate(order, storeKey) === 1;
    };

    const multipleMAOOSItemInStore = (order: Order, storeKey: string): boolean => {
        return getMAOOSItemCountWithEstimatedShipDate(order, storeKey) > 1;
    };

    useEffect(() => {
        let consolidateData = getOrderConsolidateData(order,getString);
        setOrderConsolidateData(consolidateData);
        // if there is only one MA OOS item in store, show the shipment heading
        if ((isOnlySingleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order)) {
        setShowStoreShipmentHeading((isOnlySingleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order));
        }
    }, [order, storeKey]);

    const getShipmentNumber = (order: Order, key: string): number => {
        const sortedStores = getSortedStores(order);
        const storeIndex = sortedStores.findIndex(([storeKey]) => storeKey === key);
        return storeIndex + 1;
    };

    const buildStoreHeading = (oosConsolidateData: OrderConsolidationData): string => {
        let storeHeading = storeName;
        //condition when there is only one MA oos item to show ship date - AI-110731
        if(isMAStore && isOnlySingleMAOOSItemInStore(order, storeKey) && oosConsolidateData?.oosConsolidate !== OOS_CONSOLIDATE_SPLIT_CODE && !isOrderSummary){
            const itemOOS = getStoreDataFromKey(order, storeKey)?.items.find(item => hasEstimatedShipDate(item));
            const estimatedShipDate = itemOOS ? getItemEstimatedShipDate(itemOOS) : "";
            storeHeading = `${getString("shippingOn")} ${estimatedShipDate}`;
        }
        // condition when there are multiple MA oos items to show ship date - AI-111386
        else if(isMAStore && multipleMAOOSItemInStore(order, storeKey) && oosConsolidateData?.oosConsolidate !== OOS_CONSOLIDATE_SPLIT_CODE && !isOrderSummary){
            storeHeading = "";
        
        } else if(oosConsolidateData?.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE && isMAStore && !isGiftCardForStoreKey(order, storeKey)){
            let shipmentNumber = getShipmentNumber(order, storeKey);
            storeHeading = `${storeName} ${shipmentNumber}`;

            if(!isOrderSummary){
                if(storeKey.includes("*OOS*")) {
                    storeHeading = storeHeading + " - " + orderConsolidateData?.shipDateMessageMap.get(storeKey) || "";
                } else{
                    storeHeading = storeHeading + ` - ${getString("shipNow")}`;
                }
            }
        }
        return storeHeading;
    };

    return (
        showStoreShipmentHeading && (
            <div className={`${qaTag} shipping-catolog-name`}>
                <span>{buildStoreHeading(orderConsolidateData)}</span>
            </div>
        )
    );
};

export default StoreHeading;
