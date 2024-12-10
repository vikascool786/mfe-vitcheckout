import { Provider, useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { changeOrder, fetchOrderDetail } from "./api/service/Order";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { orderAtom, OrderStore } from "./store";
import { isEqual } from "lodash";
import { ORDER_DATA } from "./utils/MOCKS";
import { generateChangeStoreResponse } from "./utils/helpers/GenerateChangeStoreResponse";

interface ICheckoutContainer {
  shopperId: string;
  cartId: string;
}

export const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
}) => {
  const [order, setOrderAtom] = useAtom(orderAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetOrderDetail = async () => {
      try {
        const response = await fetchOrderDetail(cartId);
        // const response = ORDER_DATA;
        setOrderAtom(response);
        setError(null);
      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Failed to fetch data:", error);
      } finally {
        setError(null);
        setLoading(false);
      }
    };

    const unsubscribe = OrderStore.sub(orderAtom, () => {
      const updatedOrder = OrderStore.get(orderAtom);

      // Check if updatedOrder is different from the current order
      console.log("isEqual", isEqual(updatedOrder, order));
      if (updatedOrder && !isEqual(updatedOrder, order)) {
        changeOrder(generateChangeStoreResponse(updatedOrder));
      }
    });

    fetOrderDetail();

    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout shopperId={shopperId} />
        <ShippingMethod />
        <PaymentMethod shopperId={shopperId} />
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
