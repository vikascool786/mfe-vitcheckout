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
import {Order, OrderStore} from "../interfaces/Order";
import { getStoreDataFromKey, isGiftCardForStoreKey } from "../utils/StoreUtils";
import {getItemEstimatedShipDate, hasEstimatedShipDate} from "../utils/ItemUtils";

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

    const isOnlySingleMAOOSItemInStore = (order: Order, storeKey: string): boolean => {
        const store: OrderStore | null = getStoreDataFromKey(order, storeKey);
        const isOnlySingleItemInStore = store?.items.length === 1;
        if(isOnlySingleItemInStore){
            return hasEstimatedShipDate(store?.items[0] || null);
        } else{
            return false;
        }
    };

    useEffect(() => {
        let consolidateData = getOrderConsolidateData(order);
        setOrderConsolidateData(consolidateData);
        setShowStoreShipmentHeading((isOnlySingleMAOOSItemInStore(order, storeKey) && !isOrderSummary) || !orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order));
    }, [order, storeKey]);

    const buildStoreHeading = (oosConsolidateData: OrderConsolidationData): string => {
        let storeHeading = storeName;
        //condition when there is only one MA oos item to show ship date - AI-110731
        if(isMAStore && isOnlySingleMAOOSItemInStore(order, storeKey) && oosConsolidateData?.oosConsolidate !== OOS_CONSOLIDATE_SPLIT_CODE && !isOrderSummary){
            const estimatedShipDate = getItemEstimatedShipDate(getStoreDataFromKey(order, storeKey)?.items[0] || null);
            storeHeading = `Shipping on ${estimatedShipDate}`;
        } else if(oosConsolidateData?.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE && isMAStore && !isGiftCardForStoreKey(order, storeKey)){
            let shipmentNumber = 1;
            if(storeKey.includes("*OOS*")){
                shipmentNumber = Number(storeKey.split("*").pop()) + 1;
            }
            storeHeading = `${storeName} ${shipmentNumber}`;

            if(!isOrderSummary){
                if(storeKey.includes("*OOS*")) {
                    storeHeading = storeHeading + " - " + orderConsolidateData?.shipDateMessageMap.get(storeKey) || "";
                } else{
                    storeHeading = storeHeading + " - Shipping Now";
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
