import { generateOrderTrackingId } from "./GenerateOrderTrackingId";
import { fetchOrderDetail } from "../../api/service/Order";

const URL_SEARCH_KEY_CHECKOUT_TYPE = "checkoutType";
const URL_SEARCH_KEY_STATUS = "status";
const URL_SEARCH_VALUE_STATUS_COMPLETE = "complete";

export const handleSezzleCheckout = async (
    locationSearch: string,
    checkoutSezzle: () => Promise<any>,
    buildOrder: (orderData: any) => any,
    generateChangeStoreResponse: (orderData: any) => any,
    setLoadingOrderConfirmation: (status: boolean) => void,
    confirmOrder: () => void,
    cartId: string,
) => {
    const trackingData = new Map<string, string>();
    const createSezzleOrder = async () => {
        console.log("createSezzleOrder");
        try {
            const sezzleResponse = await checkoutSezzle();
            if (typeof sezzleResponse.paymentId !== "undefined") {
                const paymentId = sezzleResponse.paymentId;
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
                            paymentMethod: {
                                ...order.paymentMethod,
                                id: paymentId,
                            },
                            userOptions: {
                                ...order.userOptions,
                                trackingID: generateOrderTrackingId(trackingData),
                            },
                        })
                    );
                }
            }
        } catch (err) {
            throw new Error("Error placing order with Sezzle");
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