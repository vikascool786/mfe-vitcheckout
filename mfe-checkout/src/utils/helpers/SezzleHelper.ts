export const handleSezzleCheckout = async (
    locationSearch: string,
    order: any,
    checkoutSezzle: () => Promise<any>,
    buildOrder: (orderData: any) => any,
    generateChangeStoreResponse: (orderData: any) => any,
    setLoadingOrderConfirmation: (status: boolean) => void,
    confirmOrder: () => void
) => {
    const createSezzleOrder = async () => {
        console.log("createSezzleOrder");
        try {
            const sezzleResponse = await checkoutSezzle();
            if (typeof sezzleResponse.paymentId !== "undefined") {
                const paymentId = sezzleResponse.paymentId;
                if (order) {
                    return buildOrder(
                        generateChangeStoreResponse({
                            ...order,
                            paymentMethod: {
                                ...order.paymentMethod,
                                id: paymentId,
                            },
                        })
                    );
                }
            }
        } catch (err) {
            throw new Error("Error placing order with Sezzle");
        }
    };

    const queryParams = new URLSearchParams(locationSearch);
    const keyCheckoutType = "checkoutType";
    const keyStatus = "status";

    const checkoutTypeValue = queryParams.get(keyCheckoutType);
    if (checkoutTypeValue?.toLowerCase() === "sezzle") {
        const statusValue = queryParams.get(keyStatus);
        if (statusValue?.toLowerCase() === "complete") {
            setLoadingOrderConfirmation(true);
            try {
                const response = await createSezzleOrder();
                console.log("create sezzle order is complete, commit order");
                console.log("create order response: " + JSON.stringify(response));
                confirmOrder();
            } catch (error) {
                console.error("Sezzle order creation failed: " + error);
            }
        } else {
            console.log("no status returned");
        }
    }
};