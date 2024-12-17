import React, { useEffect, useState } from "react";
import { Provider } from "jotai";
import { CheckoutContainer } from "./pages/checkout/CheckoutContainer";
import { orderAtom, OrderStore } from "./store";
import { OrderConfirmation } from "./pages/order-confirmation/OrderConfirmation";
import { ORDER_DATA } from "./utils/MOCKS";

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
}) => {
  const [orderconfirmation, setOrderConfirmation] = useState(false);
  const isOrderConfirmed = OrderStore.sub(orderAtom, () => {
    console.log(OrderStore.get(orderAtom)?.orderId )
    if (OrderStore.get(orderAtom)?.orderId == 101) {
      setOrderConfirmation(!orderconfirmation);
    }
  });

  return (
    <Provider store={OrderStore}>
      {!orderconfirmation ? (
        <CheckoutContainer
          cartId={appConfig.cartId}
          shopperId={appConfig.shopperId}
        />
      ) : (
        <OrderConfirmation
          products={ORDER_DATA.stores[108567].items}
          shippingAddress={[
            "Ruby Boyle",
            "1 Lower Ragsdale Dr",
            "Monterey, CA 93940",
            "831-123-4567",
          ]}
        />
      )}
    </Provider>
  );
};

export default CheckoutContainerWrapper;
