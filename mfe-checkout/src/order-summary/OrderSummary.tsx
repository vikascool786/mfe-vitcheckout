import React, { useEffect } from "react";
import "./OrderSummary.scss";
import { FormField } from "../component/Form/Field/FormField";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Cashback } from "../assets/svgs/Cashback";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { ITotal } from "../interfaces/ShopperCart";

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

interface IOrderSummary {
  totals: ITotal;
}

export const OrderSummary: React.FC<IOrderSummary> = ({ totals }) => {
  const { eWalletData, loading, error } = useShopperEWallet("2115715663");
  return (
    <div className="order-summary-container">
      <FormHeading title="Order Summary" />
      {!loading && !error && eWalletData && (
        <ApplyCashback cashbackData={eWalletData} />
      )}
      <div className="order-reedem-coupon-text">Redeem Coupon</div>
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

      {totals.cashBack && <div className="order-summary-cashback-container">
        <div className="order-cashback">
          <Cashback />
          VIFT Cashback earned in this order
        </div>
        <div>{`$${totals.cashBack}`}</div>
      </div>}
    </div>
  );
};
