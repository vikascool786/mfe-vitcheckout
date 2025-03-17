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
import {Order} from "../interfaces/Order";
import { isGiftCardForStoreKey } from "../utils/StoreUtils";

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

    useEffect(() => {
        let consolidateData = getOrderConsolidateData(order);
        setOrderConsolidateData(consolidateData);
        setShowStoreShipmentHeading(!orderIsMAOnly(order) || consolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE || orderHasGiftCards(order));
    }, [order]);

    const buildStoreHeading = (oosConsolidateData: OrderConsolidationData): string => {
        let storeHeading = storeName;
        if(oosConsolidateData?.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE && isMAStore && !isGiftCardForStoreKey(order, storeKey)){
            if(isOrderSummary){
                let shipmentNumber = 1;
                if(storeKey.includes("*OOS*")){
                    shipmentNumber = Number(storeKey.split("*").pop()) + 1;
                }
                storeHeading = `${storeName} ${shipmentNumber}`;
            } else{
                if(storeKey.includes("*OOS*"))           {
                    storeHeading = orderConsolidateData?.shipDateMessageMap.get(storeKey) || "";
                } else{
                    storeHeading = "Shipping Now";
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
