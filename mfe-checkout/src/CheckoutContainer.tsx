// import Checkout from "./checkout/Checkout";
import React from 'react'
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";

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
