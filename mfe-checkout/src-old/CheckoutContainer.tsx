import React from "react";
import Checkout from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import "./App.scss";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { Button } from "./component/Button/Button";

export const CheckoutContainer = () => {
  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout />
        <ShippingMethod />
        <PaymentMethod />
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  );
};
