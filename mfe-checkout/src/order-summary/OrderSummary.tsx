import { useAtom } from "jotai";
import React, { useState } from "react";
import { changeOrder } from "../api/service/Order";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { Cashback } from "../assets/svgs/Cashback";
import { Close } from "../assets/svgs/Close";
import { Button } from "../component/Button/Button";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { orderAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import "./OrderSummary.scss";
import { formattedNumber } from "../utils/OrderUtils";

interface IOrderSummary {
  pcid: string;
  hideCashback?: boolean;
}

interface ICouponState {
  coupon: string;
  couponError: string;
}

interface IGCState {
  gcNum: string;
  gcPin: string;
  gcError: string;
}

export const OrderSummary: React.FC<IOrderSummary> = ({
  pcid,
  hideCashback,
}) => {
  const [order, setOrder] = useAtom(orderAtom);
  const { eWalletData, loading, error } = useShopperEWallet(pcid);
  const [coupon, setCoupon] = useState<ICouponState>({
    coupon: "",
    couponError: "",
  });
  const [showApplyGiftCard, setShowApplyGiftCard] = useState(false);

  const [gcState, setgcState] = useState<IGCState>({
    gcNum: "",
    gcPin: "",
    gcError: "",
  });

  // Handle input text change for coupon
  // Handle input text change for coupon
  const handleCouponTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setCoupon((prev) => ({
      ...prev,
      coupon: value,
      // Clear the error if the coupon text is cleared
      couponError: value.trim() === "" ? "" : prev.couponError,
    }));
  };

  // Handle input changes for gift card fields
  const handleGcNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setgcState((prevState) => ({
      ...prevState,
      gcNum: e.target.value,
      gcError: "", // Clear error on input change
    }));
  };

  const handleGcPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setgcState((prevState) => ({
      ...prevState,
      gcPin: e.target.value,
      gcError: "", // Clear error on input change
    }));
  };

  const handleApplyGiftCard = () => {
    setShowApplyGiftCard(!showApplyGiftCard);
  };

  // Remove coupon from the list and update order.userOptions.coupons
  const handleRemoveCoupon = async (couponToRemove: string) => {
    if (order?.userOptions.coupons) {
      const { coupons } = order.userOptions;

      // Filter out the coupon to remove
      const updatedCoupons = coupons.filter(
        (appliedCoupon) => appliedCoupon !== couponToRemove
      );

      await changeOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            coupons: updatedCoupons, // Update the coupons array
          },
        }),
        order.id
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
    if (order?.userOptions && gcState.gcNum.trim() && gcState.gcPin.trim()) {
      changeOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            gcPin: [gcState.gcPin],
            gcNum: [gcState.gcNum],
          },
        }),
        order.id
      ).then((response) => {
        if (response.response.success?.notifications) {
          setgcState({
            gcNum: gcState.gcNum,
            gcPin: gcState.gcPin,
            gcError: response.response.success?.notifications[0]
              ?.reason as string,
          });
          console.warn(response.response.success.notifications);
          return;
        }

        if (response) {
          setOrder(response.response.success.data);
        }
      });
    }
  };

  const handleAddCoupon = async () => {
    try {
      if (order) {
        const { coupons } = order?.userOptions || {};
        const trimmedCoupon = coupon.coupon.trim();

        if (trimmedCoupon && (!coupons || !coupons.includes(trimmedCoupon))) {
          // Create a new coupons array with the new coupon
          const updatedCoupons = coupons
            ? [...coupons, trimmedCoupon]
            : [trimmedCoupon];

          const response = await changeOrder(
            generateChangeStoreResponse({
              ...order,
              userOptions: {
                ...order.userOptions,
                coupons: updatedCoupons,
              },
            }),
            order.id
          );

          if (response.response.success?.notifications) {
            setCoupon({
              coupon: coupon.coupon,
              couponError: response.response.success?.notifications[0]
                ?.reason as string,
            });
            return;
          }

          setOrder(response.response.success?.data);
          setCoupon({
            coupon: "",
            couponError: "",
          });
        }
      }
    } catch (error) {
      console.error("Error while adding coupon:", error);
      setCoupon({
        coupon: coupon.coupon,
        couponError: "An unexpected error occurred while adding the coupon.",
      });
    }
  };

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
          {!loading &&
            !error &&
            eWalletData &&
            parseInt(eWalletData.totalCoaCBAvail) > 0 && (
              <ApplyCashback cashbackData={eWalletData} />
            )}
          <div className="order-redeem-coupon-text">Redeem Coupon</div>
          <div className="order-summary-coupon-container">
            <div className="order-input-container">
              <FormField
                value={coupon.coupon}
                onChange={handleCouponTextChange}
                errorMessage={coupon.couponError}
              />
            </div>
            <div className="order-apply-container">
              <Button
                label="Apply"
                btnType="secondary"
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
            <div className="gift-card-wrapper">
              <div className="gift-card-wrapper-fields">
                <div className="gift-card-wrapper-field-1">
                  <div className="order-redeem-coupon-text">
                    Gift Card Number
                  </div>
                  <FormField
                    value={gcState.gcNum}
                    onChange={handleGcNumChange}
                    errorMessage={gcState.gcError}
                  />
                </div>
                <div className="gift-card-wrapper-field-2">
                  <div className="order-redeem-coupon-text">PIN</div>
                  <FormField
                    value={gcState.gcPin}
                    onChange={handleGcPinChange}
                    errorMessage={gcState.gcError}
                  />
                </div>
              </div>
              <div className="gift-card-apply">
                <Button
                  label="Apply"
                  btnType="secondary"
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
          if (!store.totals) return null;
          return (
            <div
              className={`order-charges-table ${isFirst ? "order-charges-table-first" : ""
                } ${isLast ? "order-charges-table-last" : ""}`}
              key={store.id || index} // Add a key for the mapped elements
            >
              <div className="shipping-catolog-name">
                {getCatalogName(store)}
              </div>
              <div className="order-summary-row">
                <div>Items Subtotal</div>
                <div>{store?.totals?.priceStr}</div>
              </div>
              <div className="order-summary-row">
                <div>Tax Total</div>
                <div>{store?.totals?.taxStr}</div>
              </div>

              <div className="order-summary-row">
                <div>Shipping</div>
                <div>{store?.totals?.shippingStr}</div>
              </div>
            </div>
          );
        })}

      {order?.userOptions?.applyEWallet && eWalletData?.totalCoaCBAvail && (
        <div className="order-summary-row">
          <div className="order-summary-row-bold">
            VIFT <span className="order-summary-row-green">Cashback</span>
          </div>
          <div>${eWalletData.totalCoaCBAvail}</div>
        </div>
      )}

      <div className="order-summary-total">
        <div>Total Due</div>
        <div>{order?.totals?.priceStr}</div>
      </div>

      {order?.totals?.cashBack && (
        <>
          <div className="order-summary-cashback-container">
            <div className="order-cashback">
              <Cashback />
              VIFT Cashback earned in this order
            </div>
            <div>{`${order.totals.cashBackStr}`}</div>
          </div>
        </>
      )}

      {order?.stores && (
        <div className="shipping-item-container">
          {Object.entries(order?.stores)
            .reverse()
            .map(([key, store]) => {
              return (
                store && (
                  <div className="order-summary-cashback-container">
                    <div className="order-cashback">
                      {store?.store?.isMA === 1 ? (
                        `BV earned in this order`
                      ) : (
                        `IBV earned in this order`
                      )}
                    </div>
                    <div>{store?.store?.isMA === 1 ? formattedNumber(store.totals.bv) : formattedNumber(store.totals.ibv)}</div>
                  </div>
                )
              );
            })}
        </div>
      )}
    </div>
  );
};
