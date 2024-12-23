import React from "react";
import { Provider } from "jotai";
import HeadHelmet from "./head-helmet/HeadHelmet";
import CheckoutContainer from "./checkout/CheckoutContainer";
import { OrderStore } from "./store";

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
}) => {
  return (
    <div>
      <Provider store={OrderStore}>
        <CheckoutContainer
          cartId={appConfig.cartId}
          shopperId={appConfig.shopperId}
        />
      </Provider>
      <HeadHelmet />
    </div>
  );
};

export default CheckoutContainerWrapper;
