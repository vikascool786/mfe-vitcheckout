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

    const isOnlySingleMAOOSItemInStore = (order: Order, storeKey: string): boolean => {
        const store: OrderStore | null = getStoreDataFromKey(order, storeKey);
        const isOnlySingleItemInStore = store?.items.length === 1;
        if(isOnlySingleItemInStore){
            return hasEstimatedShipDate(store?.items[0] || null);
        } else{
            return false;
        }
    };

        const multipleMAOOSItemInStore = (order: Order, storeKey: string): boolean => {
        const store: OrderStore | null = getStoreDataFromKey(order, storeKey);
        const multipleItemsInStore = store?.items.length  && store?.items.length > 1;
        if(multipleItemsInStore){
            return hasEstimatedShipDate(store?.items[0] || null); 
        } else{
            return false;
        }
    };

    useEffect(() => {
        let consolidateData = getOrderConsolidateData(order,getString);
        setOrderConsolidateData(consolidateData);
        // if there is only one MA OOS item in store, show the shipment heading
        if ((isOnlySingleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order)) {
        setShowStoreShipmentHeading((isOnlySingleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order));
        } else {
        // if there are multiple MA OOS items in store, show the shipment heading as per the condition
        setShowStoreShipmentHeading((multipleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order));
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
            const estimatedShipDate = getItemEstimatedShipDate(getStoreDataFromKey(order, storeKey)?.items[0] || null);
            storeHeading = `${getString("shippingOn")} ${estimatedShipDate}`;
        // condition when there are multiple MA oos items to show ship date - AI-111386
        }
        else if(isMAStore && multipleMAOOSItemInStore(order, storeKey) && oosConsolidateData?.oosConsolidate !== OOS_CONSOLIDATE_SPLIT_CODE && !isOrderSummary){
            storeHeading = `${getString("shippingOn")} ${oosConsolidateData.availabilityDate}`;
        
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
