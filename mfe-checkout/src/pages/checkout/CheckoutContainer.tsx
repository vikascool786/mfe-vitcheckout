import { useAtom } from "jotai";
import isEqual from "lodash.isequal";
import React, { useEffect, useState } from "react";
import {
  buildOrder
} from "../../api/service/Order";
import "../../App.scss";
import { Checkout } from "../../checkout/Checkout";
import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { OrderSummary } from "../../order-summary/OrderSummary";
import { PaymentMethod } from "../../payment-method/PaymentMethods";
import { ShippingMethod } from "../../shipping-methods/ShippingMethod";
import { orderAtom, OrderStore } from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";

export const getInitialBuildOrderData = (cartId: string): ChangeOrder => {
  return {
    debug: true,
    id: cartId,
    customer_id: "",
    ufo_id: "",
    shipping_country: "USA",
    product_country: "USA",
    language: "ENG",
    site_type: "W",
    application: "cart",
    userOptions: {
      applyCashback: false,
      applyEWallet: false,
      isOfAge: false,
      trackingId: "",
      deliveryDate: "",
      deliveryTime: 1234567890,
      signatureRequired: false,
      oosConsolidate: false,
      userSessionId: "",
      coupons: [],
    },
  };
};

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

  let isOrderBuilt = false;

  useEffect(() => {
    const buildOrderForStore = async (data: ChangeOrder) => {
      const orderResponse = await buildOrder(data);
      const { success, errors } = orderResponse.response;

      if (errors || isOrderBuilt) {
        alert(errors.message);
        return;
      }

      isOrderBuilt = true;
      setOrderAtom(success.data);
    };

    buildOrderForStore(getInitialBuildOrderData(cartId));

    const unsubscribe = OrderStore.sub(orderAtom, async () => {
      // condition to check if order obj is same
      const newOrder = OrderStore.get(orderAtom);
      if (!newOrder) return;

      if (!order) return;

      if (
        isEqual(
          generateChangeStoreResponse(newOrder),
          generateChangeStoreResponse(order)
        )
      ) {
        return;
      }

      setOrderAtom(newOrder);
    });

    return unsubscribe;
  }, [isOrderBuilt]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        {order && (
          <>
            <Checkout shopperId={shopperId} />
            <ShippingMethod />
            <PaymentMethod shopperId={shopperId} cartId={cartId} />
          </>
        )}
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
