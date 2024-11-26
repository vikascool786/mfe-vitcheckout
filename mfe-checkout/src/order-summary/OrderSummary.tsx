import { useAtom } from "jotai";
import React from "react";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { Button } from "../component/Button/Button";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { shippingData, total } from "../store";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import "./OrderSummary.scss";
import { Cashback } from "../assets/svgs/Cashback";

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

interface IOrderSummary {}

export const OrderSummary: React.FC<IOrderSummary> = () => {
  const [totalData] = useAtom(total);
  const [shipping] = useAtom(shippingData);
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
        <div className="order-summary-row">
          <div>Items Subtotal</div>
          <div>${totalData?.price}</div>
        </div>
        <div className="order-summary-row">
          <div>Tax Total</div>
          <div>TBD</div>
        </div>
        {shipping && (
          <div className="order-summary-row">
            <div>{shipping?.shippingSelected?.method} Shipping</div>
            <div>
              {shipping?.shippingSelected?.total === 0
                ? "Free"
                : `$${shipping?.shippingSelected?.total}`}
            </div>
          </div>
        )}
      </div>

      <div className="order-summary-total">
        <div>Total Due</div>
        <div>${totalData?.price}</div>
      </div>

      {totalData?.cashBack && (
        <div className="order-summary-cashback-container">
          <div className="order-cashback">
            <Cashback />
            VIFT Cashback earned in this order
          </div>
          <div>{`$${totalData.cashBack}`}</div>
        </div>
      )}
    </div>
  );
};
