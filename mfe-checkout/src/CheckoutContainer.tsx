import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { changeOrder, fetchOrderDetail } from "./api/service/Order";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { orderAtom, OrderStore } from "./store";
import { generateChangeStoreResponse } from "./utils/helpers/GenerateChangeStoreResponse";

interface ICheckoutContainer {
  shopperId: string;
  cartId: string;
}

export const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
}) => {
  const setOrderAtom = useSetAtom(orderAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetOrderDetail = async () => {
      try {
        const response = await fetchOrderDetail(cartId);
        // const response = ORDER_DATA;
        setOrderAtom(response);
        setError(null);
        return response;
      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Failed to fetch data:", error);
      } finally {
        setError(null);
        setLoading(false);
      }
    };

    const unsubscribe = OrderStore.sub(orderAtom, async () => {
      const updatedOrder = OrderStore.get(orderAtom);
      if (updatedOrder) {
        const newOrderData = await changeOrder(generateChangeStoreResponse(updatedOrder), cartId);
        if (newOrderData.response.errors) {
          alert(newOrderData.response.errors.message)
          console.log(newOrderData)
          return
        }

        console.log(newOrderData.response.success.data)
      }
    });

    fetOrderDetail()
        .then((response: any) => {
          console.log("fetch order response: " + JSON.stringify(response));
          if(response === undefined){
            //TODO: do a POST build order
            /*const buildOrderPromise = buildOrder(generateStandardOrderPayload(cartId, "USA", "ENG"));
            buildOrderPromise.then((response: any) => {
              console.log("build order response: " + JSON.stringify(response));
              if(response !== undefined){
                setOrderAtom(response);
              }
            })*/
          }
        })
        .catch((error: { message: string; }) => {
          console.error("fetch order failed: " + error.message);
        })

    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout shopperId={shopperId} />
        <ShippingMethod />
        <PaymentMethod shopperId={shopperId} cartId={cartId}/>
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
