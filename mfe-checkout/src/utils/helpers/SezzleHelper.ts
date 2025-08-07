import { generateOrderTrackingId } from "./GenerateOrderTrackingId";
import { fetchOrderDetail } from "../../api/service/Order";
import { Order } from "../../interfaces/Order";
import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { IPaymentMethod } from "../../interfaces/ShopperCart";
import { SEZZLE } from "../../payment-method/PaymentType";

const URL_SEARCH_KEY_CHECKOUT_TYPE = "checkoutType";
const URL_SEARCH_KEY_STATUS = "status";
const URL_SEARCH_VALUE_STATUS_COMPLETE = "complete";

export const handleSezzleCheckout = async (
    locationSearch: string,
    checkoutSezzle: (isGuest: boolean) => Promise<any>,
    buildOrder: (orderData: any) => any,
    generateChangeStoreResponse: (order: Order, customer_id: string) => ChangeOrder,
    setLoadingOrderConfirmation: (status: boolean) => void,
    confirmOrder: () => void,
    cartId: string,
    pcid: string,
    isGuest: boolean,
) => {
    const trackingData = new Map<string, string>();
    const createSezzleOrder = async () => {
        console.log("createSezzleOrder");
        let sezzleResponse;
        try {
            sezzleResponse = await checkoutSezzle(isGuest);
        } catch (err) {
            throw new Error("Error placing order with Sezzle");
        }
        if (sezzleResponse) {
                const orderUUId = sezzleResponse.orderUUID ?? null;
                trackingData.set("sezzle", orderUUId);
                const order = await fetchOrderDetail(cartId);
                const isMissingBilling = order.billingAddress;
                const billingAddress = isMissingBilling ?  { ...order.shippingAddress } : { ...order.billingAddress };

                if (order) {
                    return buildOrder(
                        generateChangeStoreResponse({
                            ...order,
                            billingAddress: billingAddress,
                            paymentMethod: buildPaymentForSezzle(order, isGuest, sezzleResponse),
                            userOptions: {
                                ...order.userOptions,
                                trackingID: generateOrderTrackingId(trackingData),
                            },
                        }, pcid)
                    );
                }
        }
    };

    if (isSezzleSelectedPayment(locationSearch)) {
        const queryParams = new URLSearchParams(locationSearch);
        const statusValue = queryParams.get(URL_SEARCH_KEY_STATUS);
        if (isSezzleSuccessful(locationSearch)) {
            setLoadingOrderConfirmation(true);
            try {
                const response = await createSezzleOrder();
                confirmOrder();
            } catch (error) {
                console.error("Sezzle order creation failed: " + error);
            }
        } else {
            console.log("no status returned");
        }
    }
};

const buildPaymentForSezzle = (order: Order, isGuest: boolean, sezzleResponse: any): IPaymentMethod => {
    if(isGuest){
        return {
            ...order.paymentMethod,
            accountName: `${sezzleResponse?.sezzleOrder.customer?.first_name} ${sezzleResponse?.sezzleOrder?.customer?.last_name}`,
            typeID: SEZZLE.typeId,
        }
    } else {
        return {
            ...order.paymentMethod,
            id: sezzleResponse.paymentId,
        }
    }
};

export const isSezzleSelectedPayment = (locationSearch: string): boolean => {
    const queryParams = new URLSearchParams(locationSearch);
    const checkoutTypeValue = queryParams.get(URL_SEARCH_KEY_CHECKOUT_TYPE);
    return checkoutTypeValue?.toLowerCase() === "sezzle";
};

export const isSezzleSuccessful = (locationSearch: string): boolean => {
    const queryParams = new URLSearchParams(locationSearch);
    const statusValue = queryParams.get(URL_SEARCH_KEY_STATUS);
    return statusValue?.toLowerCase() === URL_SEARCH_VALUE_STATUS_COMPLETE;
};