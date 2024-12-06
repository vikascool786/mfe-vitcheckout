import { useAtom } from "jotai";
import React, { useState } from "react";
import { Cashback } from "../assets/svgs/Cashback";
import { Button } from "../component/Button/Button";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { orderData } from "../store";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import "./OrderSummary.scss";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { Close } from "../assets/svgs/Close";

interface IOrderSummary {}

export const OrderSummary: React.FC<IOrderSummary> = () => {
  const [order] = useAtom(orderData);
  const { eWalletData, loading, error } = useShopperEWallet("2115715663");
  const [coupons, setCoupons] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");

  // Handle input text change for coupon
  const handleCouponTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoupon(e.target.value);
  };

  // Add coupon to the list
  const handleAddCoupon = () => {
    if (coupon.trim() && !coupons.includes(coupon.trim())) {
      setCoupons([...coupons, coupon.trim()]);
      setCoupon(""); // Clear the input field after adding
    }
  };

  const handleRemoveCoupon = (couponToRemove: string) => {
    setCoupons(
      coupons.filter((appliedCoupon) => appliedCoupon !== couponToRemove)
    );
  };

  return (
    <div className="order-summary-container">
      <FormHeading title="Order Summary" />
      {!loading && !error && eWalletData && (
        <ApplyCashback cashbackData={eWalletData} />
      )}
      <div className="order-reedem-coupon-text">Redeem Coupon</div>
      <div className="order-summary-coupon-container">
        <div className="order-input-container">
          <FormField value={coupon} onChange={handleCouponTextChange} />
        </div>
        <div className="order-apply-container">
          <Button label="Apply" type="secondary" onClick={handleAddCoupon} />
        </div>
      </div>
      {coupons.length > 0 && (
        <div className="order-applied-coupons">
          {coupons.map((appliedCoupon, index) => (
            <li key={index} className="order-applied-coupon">
              {appliedCoupon}
              <Close onClick={() => handleRemoveCoupon(appliedCoupon)} />
            </li>
          ))}
        </div>
      )}
      <div className="order-sub-text underlined">Apply gift card</div>

      <div className="order-charges-table">
        <div className="order-summary-row">
          <div>Items Subtotal</div>
          <div>${order?.totals?.price}</div>
        </div>
        <div className="order-summary-row">
          <div>Tax Total</div>
          <div>${order?.totals.tax}</div>
        </div>
        {order?.userOptions?.applyCashback && eWalletData?.cashbackAvail && (
          <div className="order-summary-row">
            <div className="order-summary-row-bold">
              VIFT <span className="order-summary-row-green">Cashback</span>
            </div>
            <div>${eWalletData.cashbackAvail}</div>
          </div>
        )}
        <div className="order-summary-row">
          <div>Shipping</div>
          <div>${order?.totals.shipping}</div>
        </div>
      </div>

      <div className="order-summary-total">
        <div>Total Due</div>
        <div>${order?.totals?.price}</div>
      </div>

      {order?.totals?.cashBack && (
        <div className="order-summary-cashback-container">
          <div className="order-cashback">
            <Cashback />
            VIFT Cashback earned in this order
          </div>
          <div>{`$${order.totals.cashBack}`}</div>
        </div>
      )}
    </div>
  );
};
