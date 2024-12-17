import { useAtom } from "jotai";
import React, { useState } from "react";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { Cashback } from "../assets/svgs/Cashback";
import { Close } from "../assets/svgs/Close";
import { Button } from "../component/Button/Button";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { orderAtom } from "../store";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import "./OrderSummary.scss";
import { getCatalogName } from "../utils/helpers/GetCatalog";

interface IOrderSummary {
  hideCashback?: boolean;
}

export const OrderSummary: React.FC<IOrderSummary> = ({ hideCashback }) => {
  const [order, setOrder] = useAtom(orderAtom);
  const { eWalletData, loading, error } = useShopperEWallet("2115715663");
  const [coupon, setCoupon] = useState("");
  const [showApplyGiftCard, setShowApplyGiftCard] = useState(false);
  const [gcPin, setGcPin] = useState<string>("");
  const [gcNum, setGcNum] = useState<string>("");

  // Handle input text change for coupon
  const handleCouponTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoupon(e.target.value);
  };

  // Handle input changes for gift card fields
  const handleGcNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGcNum(e.target.value);
  };

  const handleGcPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGcPin(e.target.value);
  };

  const handleApplyGiftCard = () => {
    setShowApplyGiftCard(!showApplyGiftCard);
  };

  // Remove coupon from the list and update order.userOptions.coupons
  const handleRemoveCoupon = (couponToRemove: string) => {
    if (order?.userOptions.coupons) {
      const { coupons } = order.userOptions;

      // Filter out the coupon to remove
      const updatedCoupons = coupons.filter(
        (appliedCoupon) => appliedCoupon !== couponToRemove
      );

      setOrder({
        ...order,
        userOptions: {
          ...order.userOptions,
          coupons: updatedCoupons, // Update the coupons array
        },
      });
    }
  };

  // Add gift card to the order
  const handleAddGiftCard = () => {
    if (order?.userOptions && gcPin.trim() && gcNum.trim()) {
      setOrder({
        ...order,
        userOptions: {
          ...order.userOptions,
          gcPin: [gcPin],
          gcNum: [gcNum],
        },
      });

      setGcPin("");
      setGcNum("");
    }
  };

  const handleAddCoupon = () => {
    if (order) {
      if (order?.userOptions.coupons) {
        const { coupons } = order.userOptions;
        const trimmedCoupon = coupon.trim();

        // Add coupon if not empty and not already present
        if (trimmedCoupon && !coupons.includes(trimmedCoupon)) {
          setOrder({
            ...order,
            userOptions: {
              ...order.userOptions,
              coupons: [...coupons, coupon],
            },
          });

          setCoupon("");
        }
      } else {
        setOrder({
          ...order,
          userOptions: {
            ...order.userOptions,
            coupons: [coupon],
          },
        });
      }
    }
  };

  if (order?.stores) {
    Object.entries(order?.stores).map(([key, store], index) => {
      console.log(key, store);
    });
  }

  const storesTotals =
    order?.stores &&
    Object.entries(order?.stores).map(([key, store], index) => {
      return store;
    });

  return (
    <div className="order-summary-container">
      <FormHeading title="Order Summary" />
      {!hideCashback && (
        <>
          {" "}
          {!loading && !error && eWalletData && (
            <ApplyCashback cashbackData={eWalletData} />
          )}
          <div className="order-redeem-coupon-text">Redeem Coupon</div>
          <div className="order-summary-coupon-container">
            <div className="order-input-container">
              <FormField value={coupon} onChange={handleCouponTextChange} />
            </div>
            <div className="order-apply-container">
              <Button
                label="Apply"
                type="secondary"
                onClick={handleAddCoupon}
              />
            </div>
          </div>
          {order?.userOptions.coupons &&
            order?.userOptions.coupons?.length > 0 && (
              <div className="order-applied-coupons">
                {order?.userOptions.coupons.map((appliedCoupon, index) => (
                  <li key={index} className="order-applied-coupon">
                    {appliedCoupon}
                    <Close onClick={() => handleRemoveCoupon(appliedCoupon)} />
                  </li>
                ))}
              </div>
            )}
          {showApplyGiftCard && (
            <div className="gift-card-container">
              <div className="gift-card-container-fields">
                <div className="gift-card-container-field-1">
                  <FormField
                    value={gcNum}
                    onChange={handleGcNumChange}
                    placeholder="Gift Card Number"
                  />
                </div>
                <div className="gift-card-container-field-2">
                  <FormField
                    value={gcPin}
                    onChange={handleGcPinChange}
                    placeholder="Gift Card PIN"
                  />
                </div>
              </div>
              <div className="gift-card-apply">
                <Button
                  label="Apply Gift Card"
                  type="secondary"
                  onClick={handleAddGiftCard}
                />
              </div>
            </div>
          )}
          <div
            className="order-sub-text underlined"
            onClick={handleApplyGiftCard}
          >
            {showApplyGiftCard ? "Hide gift card" : "Apply gift card"}
          </div>
        </>
      )}

      {storesTotals &&
        storesTotals.map((store, index) => {
          const isFirst = index === 0;
          const isLast = index === storesTotals.length - 1; // Fix the condition for the last element
          return (
            <div
              className={`order-charges-table ${
                isFirst ? "order-charges-table-first" : ""
              } ${isLast ? "order-charges-table-last" : ""}`}
              key={store.id || index} // Add a key for the mapped elements
            >
              <div className="shipping-catolog-name">
                {getCatalogName(store)}
              </div>
              <div className="order-summary-row">
                <div>Items Subtotal</div>
                <div>${store?.totals.price}</div>
              </div>
              <div className="order-summary-row">
                <div>Tax Total</div>
                <div>${store?.totals.tax}</div>
              </div>

              <div className="order-summary-row">
                <div>Shipping</div>
                <div>${store?.totals.shipping}</div>
              </div>
            </div>
          );
        })}

      {order?.userOptions?.applyCashback && eWalletData?.cashbackAvail && (
        <div className="order-summary-row">
          <div className="order-summary-row-bold">
            VIFT <span className="order-summary-row-green">Cashback</span>
          </div>
          <div>${eWalletData.cashbackAvail}</div>
        </div>
      )}

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
