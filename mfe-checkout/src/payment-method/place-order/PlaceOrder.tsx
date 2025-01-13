import React, { memo, useState } from "react";
import "./PlaceOrder.scss";
import { Button } from "../../component/Button/Button";
import { CLICK2PAY, PAYPAL, SEZZLE } from "../PaymentType";
import { getTransactionData } from "../../api/service/Click2PayTransaction";
import Click2PayPlaceOrder from "../../payment-method-click2pay/Click2PayPlaceOrder";
import { addTempPaymentMethod } from "../../api/service/ShoppersPaymentMethods";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { loadScript } from "@paypal/paypal-js";
import { buildOrder } from "../../api/service/Order";
import { fetchSiteFlagData } from "../../api/service/SiteFlags";
import { useApi } from "../../hooks/useAPI";
import {
    GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY,
    GET_PAYPAL_CLIENT_ID,
    GET_PAYPAL_RETURN_URL,
} from "../../utils/urlResolver";
import {Order} from "../../interfaces/Order";
import {generateOrderTrackingId} from "../../utils/helpers/GenerateOrderTrackingId";
import {Address} from "../../interfaces/Address";
import {useAtom} from "jotai/index";
import {siteApiData} from "../../checkout/siteAtom";
import {fetchSezzleUrl} from "../../api/ajaxaction/Sezzle";

interface IPlaceOrder {
    confirmOrder: () => void;
    errorMessage: string;
    paymentTypeId: number;
    shopperId: string;
    siteId: string;
    order?: Order;
}

const PAYPAL_TOKEN_URL = (shopperId: string) =>
    // make the return url and cancel url dynamic
    // TODO: PICK THIS UP FROM ENVIORNMENT VARIABLES
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/Paypal/${shopperId}/Token?creditFlow=false&hideShipping=false&markFlow=false&returnURL=${GET_PAYPAL_RETURN_URL()}&cancelURL=${GET_PAYPAL_RETURN_URL()}&api_key=${GET_API_KEY()}`;

const PlaceOrder: React.FC<IPlaceOrder> = ({
    confirmOrder,
    errorMessage,
    paymentTypeId,
    shopperId,
    siteId,
    order,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const trackingData = new Map<string, string>();
    const [siteData] = useAtom(siteApiData(siteId));

    const { data: paypalToken, error } = useApi<{ tokenId: string }>(
        PAYPAL_TOKEN_URL(shopperId),
        "GET"
    );

    const handlePlaceOrder = async () => {
        try {
            setIsLoading(true);

            switch (paymentTypeId) {
                case CLICK2PAY.typeId:
                    await handleClick2PayOrderUpdate();
                    confirmOrder();
                    break;
                case SEZZLE.typeId:
                    console.log("place order with Sezzle");
                    await handleSezzleOrder();
                    break;
                case PAYPAL.typeId:
                    // fetch paypal site flags
                    const siteFlags = await fetchSiteFlagData(siteId, "393");
                    const data = JSON.parse(siteFlags[0].auxDataText);

                    // loading paypal sdk
                    loadScript({
                        clientId: GET_PAYPAL_CLIENT_ID(), // Your PayPal Client ID
                        merchantId: data.merchantId, // Optional: Specify merchant ID
                        environment: data.environment, // Use "sandbox" or "production"
                        currency: "USD", // Set your currency
                        intent: "capture", // "capture" for immediate payment
                        components: "buttons",
                    })
                        .then((paypal) => {
                            if (!paypal) {
                                console.error("PayPal SDK failed to load correctly");
                                return;
                            }
                            console.log("PayPal SDK loaded:", paypal);
                        })
                        .catch((error) =>
                            console.error("PayPal SDK failed to load", error)
                        );

                    if (!paypalToken) {
                        alert("Failed to fetch PayPal token, check console for message");
                        console.log(error);
                        return;
                    }
                    const url = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalToken.tokenId}`;
                    window.open(url, "_self");
                    break;
                default:
                    confirmOrder();
                    break;
            }
        } catch (error) {
            console.error("Error placing order:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getClickToPayTransactionData = async (
        flowId: string,
        transId: string,
        total: string
    ) => {
        try {
            const response = await getTransactionData(flowId, transId, total);
            return new Promise((resolve) => {
                resolve(response);
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    const handleClick2PayOrderUpdate = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            let c2pBillingAddress: Address = {
                first: "", last: "", address1: "", city: "", state: "", zip: "",
            };
            const digitalCardId = Click2PayPlaceOrder.getDigitalCardId();
            const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(
                // @ts-ignore
                window.c2pInstance,
                digitalCardId
            );

            c2pPlaceOrderPromise
                .then((response: any) => {
                    if (response.checkoutActionCode === "COMPLETE") {
                        const transId = response.headers["merchant-transaction-id"];
                        const flowId = response.headers["x-src-cx-flow-id"];
                        const total = order ? order.totals.price.toString() : "0";
                        trackingData.set("transactionId", transId);
                        trackingData.set("flowId", flowId);

                        return getClickToPayTransactionData(flowId, transId, total);
                    } else {
                        throw new Error("Click2pay checkoutActionCode not Complete");
                    }
                })
                .then((response: any) => {
                    const paymentMethodResponse = response.data.paymentMethod;
                    const walletData = {
                        name: paymentMethodResponse.accountName,
                        number: paymentMethodResponse.number,
                        token: paymentMethodResponse.token,
                        month: paymentMethodResponse.expMonth,
                        year: paymentMethodResponse.expYear,
                        type: paymentMethodResponse.typeID,
                    };

                    c2pBillingAddress = response.data.billing;
                    c2pBillingAddress.country = siteData.siteCountryCode;

                    return addTempPaymentMethod(shopperId, walletData);
                })
                .then((response: any) => {
                    const paymentId = response.data.id;
                    if (order) {
                        return buildOrder(
                            generateChangeStoreResponse({
                                ...order,
                                paymentMethod: {
                                    ...order.paymentMethod,
                                    id: paymentId,
                                },
                                billingAddress: c2pBillingAddress,
                                userOptions: {
                                    ...order.userOptions,
                                    trackingID: generateOrderTrackingId(trackingData)
                                },
                            })
                        );
                    }
                })
                .then(() => {
                    console.log("Click2pay place order completed successfully");
                    resolve(); // Fulfill the outer promise
                })
                .catch((error: { message: string }) => {
                    console.error("c2p place order failed: " + error.message);
                    reject(error); // Reject the outer promise
                });
        });
    };

    const handleSezzleOrder = async () => {
        //const total = order ? order.totals.price.toString() : "0";
        const total = "33.44"; //TODO update when totals come back correctly again
        const sezzleResponse = await fetchSezzleUrl(total);
        if (typeof sezzleResponse.url != 'undefined') {
            window.location = sezzleResponse.url;
        } else{
            throw new Error("Error connecting with Sezzle");
        }
    };

    return (
        <div className="checkout-place-order">
            <div className="checkout-place-order-text">
                By clicking place order, you agree to the SHOP.COM Terms of Use and
                Privacy Policy.
            </div>
            {errorMessage.length > 0 && (
                <div className="error-msg error-msg--padding">
                    <div className="error-msg--bold">
                        There was an issue placing your order
                    </div>
                    <div className="error-msg__detail">{errorMessage}</div>
                </div>
            )}
            {isLoading ? (
                <div>Processing Order...</div>
            ) : (
                <Button label="Place Order" btnType="primary" onClick={handlePlaceOrder} />
            )}
        </div>
    );
};

export default memo(PlaceOrder);
