import React, { useEffect } from "react";
import { Provider } from "jotai";
import { CheckoutContainer } from "./CheckoutContainer";
import { OrderStore } from "./store";

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
}) => {
  
  return (
    <div className="container">
      <Provider store={OrderStore}>
        <CheckoutContainer
          cartId={appConfig.cartId}
          shopperId={appConfig.shopperId}
        />
      </Provider>
    </div>
  );
};

export default CheckoutContainerWrapper;
