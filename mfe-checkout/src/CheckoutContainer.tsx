import React from "react";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import "./App.scss";

export const CheckoutContainer = () => {
  return (
    <div className="checkout-container">
      <Checkout />
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
