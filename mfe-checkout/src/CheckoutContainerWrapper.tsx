import React from "react";
import { Provider } from "jotai";
import CheckoutContainer from "./checkout/CheckoutContainer";
import { OrderStore } from "./store";
import "./checkout/Checkout.scss"

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
  siteId: string;
  pcid: string;
  sessionId: string;
  portalId: string;
  isGuest: boolean;
}) => {
  return (
    <div className="checkout-container-wrapper">
      <Provider store={OrderStore}>
        <CheckoutContainer
          cartId={appConfig.cartId}
          shopperId={appConfig.shopperId}
          siteId={appConfig.siteId}
          pcid={appConfig.pcid}
          sessionId={appConfig.sessionId}
          portalId={appConfig.portalId}
          isGuest={appConfig.isGuest}
        />
      </Provider>
    </div>
  );
};

export default CheckoutContainerWrapper;
