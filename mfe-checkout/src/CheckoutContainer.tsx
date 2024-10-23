import React from "react";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import "./App.scss";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";

export const CheckoutContainer = () => {
  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout />
        <ShippingMethod />
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
