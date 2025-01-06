import React, {useState} from "react";
import { Button } from "../../component/Button/Button";
import "./PlaceOrder.scss";
import {CLICK2PAY, SEZZLE} from "../PaymentType";
import {getTransactionData} from "../../api/service/Click2PayTransaction";
import Click2PayPlaceOrder from "../../payment-method-click2pay/Click2PayPlaceOrder";
import {addTempPaymentMethod} from "../../api/service/ShoppersPaymentMethods";
import {generateChangeStoreResponse} from "../../utils/helpers/GenerateChangeStoreResponse";
import {updatePaymentMethod} from "../../utils/OrderUtils";
import {useAtom} from "jotai/index";
import {orderAtom} from "../../store";
import {buildOrder} from "../../api/service/Order";

interface IPlaceOrder {
  confirmOrder: () => void;
  errorMessage: string;
  paymentTypeId: number;
  shopperId: string;
  cartId: string;
}

export const PlaceOrder: React.FC<IPlaceOrder> = ({ confirmOrder, errorMessage, paymentTypeId, shopperId, cartId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [order] = useAtom(orderAtom);

    const handlePlaceOrder = async () => {
        try {
            setIsLoading(true);

            switch (paymentTypeId) {
                case CLICK2PAY.typeId:
                    await handleClick2PayOrderUpdate();
                    break;
                case SEZZLE.typeId:
                    console.log("place order with Sezzle");
                    break;
                default:
            }

            // Proceed with placing the order
            confirmOrder();
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


    return (
    <div className="checkout-place-order">
      <div className="checkout-place-order-text">
        By clicking place order, you agree to the SHOP.COM Terms of Use and
        Privacy Policy.
      </div>
        {errorMessage.length > 0 && (
            <div className="error-msg error-msg--padding">
                <div className="error-msg--bold">There was an issue placing your order</div>
                <div className="error-msg__detail">{errorMessage}</div>
            </div>
        )
        }
        {isLoading ? (
            <div>Processing Order...</div>
        ):
            <Button label="Place Order" type="primary" onClick={handlePlaceOrder} />
        }
    </div>
  );
};
