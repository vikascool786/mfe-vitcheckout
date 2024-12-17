import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { buildOrder, changeOrder, fetchOrderDetail } from "../../api/service/Order";
import "../../App.scss";
import { Checkout } from "../../checkout/Checkout";
import { OrderSummary } from "../../order-summary/OrderSummary";
import { PaymentMethod } from "../../payment-method/PaymentMethods";
import { ShippingMethod } from "../../shipping-methods/ShippingMethod";
import { orderAtom, OrderStore } from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { generateStandardOrderPayload } from "../../utils/helpers/GenerateStandardOrderPayload";
import { ChangeOrder } from "../../interfaces/ChangeOrder";

const getInitialBuildOrderData = (cartId: string): ChangeOrder => {
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
  const setOrderAtom = useSetAtom(orderAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let isOrderBuilt = false;

  useEffect(() => {
    const buildOrderForStore = async (data: ChangeOrder) => {
      const orderResponse = await buildOrder(getInitialBuildOrderData(cartId));
      const { success, errors } = orderResponse.response;

      if (errors) {
        alert(errors.message);
        return;
      }

      setOrderAtom(success.data);
    };

    const getOrder = async () => {
      try {
        const response = await fetchOrderDetail(cartId);
        // const response = ORDER_DATA;
        setOrderAtom(response);
        setError(null);
        return response;
      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Failed to fetch data:", error);
        handleBuildOrder(cartId);
      } finally {
        setError(null);
        setLoading(false);
      }
    };

    buildOrderForStore(getInitialBuildOrderData(cartId));

    const unsubscribe = OrderStore.sub(orderAtom, async () => {
        // condition to check if order obj is same
    });

    return unsubscribe;
  }, [isOrderBuilt]);

  const handleBuildOrder = async (cartId: string) => {
    const buildOrderPromise = buildOrder(
      generateStandardOrderPayload(cartId, "USA", "ENG")
    );
    buildOrderPromise.then((response: any) => {
      console.log("build order response: " + JSON.stringify(response));
      if (response !== undefined) {
        setOrderAtom(response);
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout shopperId={shopperId} />
        <ShippingMethod />
        <PaymentMethod shopperId={shopperId} cartId={cartId} />
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
