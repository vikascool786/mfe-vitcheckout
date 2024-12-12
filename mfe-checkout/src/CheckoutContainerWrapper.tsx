import React from 'react'
import { Provider } from "jotai";
import { OrderStore } from "./store";
import { CheckoutContainer } from "./CheckoutContainer";

const CheckoutContainerWrapper = () => (
  <div className="container">
    <Provider store={OrderStore}>
      <CheckoutContainer
        cartId="cart_2282210204_W_USA_USA_ENG"
        shopperId="WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"
      />
    </Provider>
  </div>
);

export default CheckoutContainerWrapper;