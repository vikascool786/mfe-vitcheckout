import React from "react";
import "./OrderSummary.scss";
import { FormField } from "../component/Form/Field/FormField";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";

const ORDER_SUMMARY = [
  {
    title: "Items Subtotal",
    value: "$25.00",
  },
  {
    title: "Tax Total",
    value: "$2.02",
  },
  {
    title: "Standard Shipping",
    value: "$6.00",
  },
];

export const OrderSummary: React.FC = () => {
  return (
    <div className="order-summary-container">
      <FormHeading title="Order Summary" />
      <div>Redeem Coupon</div>
      <div className="order-summary-coupon-container">
        <div className="order-input-container">
          <FormField />
        </div>
        <div className="order-apply-container">
          <Button label="Apply" type="secondary" />
        </div>
      </div>
      <div className="order-sub-text underlined">Apply gift card</div>

      <div className="order-charges-table">
        {ORDER_SUMMARY.map((item, index) => (
          <div key={index} className="order-summary-row">
            <div>{item.title}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="order-summary-total">
        <div>Total Due</div>
        <div>$33.02</div>
      </div>

      <div className="order-summary-cashback-container">
        <div>$ VIFT Cashback earned in this order</div>
        <div>$0.25</div>
      </div>
    </div>
  );
};
