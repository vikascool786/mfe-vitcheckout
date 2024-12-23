import React from "react";
import { Provider } from "jotai";
import CheckoutContainer from "./checkout/CheckoutContainer";
import { OrderStore } from "./store";

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
  siteId: string;
  pcid: string;
}) => {
  return (
    <div>
      <Provider store={OrderStore}>
        <CheckoutContainer
          cartId={appConfig.cartId}
          shopperId={appConfig.shopperId}
          siteId={appConfig.siteId}
          pcid={appConfig.pcid}
        />
      </Provider>
    </div>
  );
};

export default CheckoutContainerWrapper;
