import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { buildOrder, changeOrder } from "../api/service/Order";
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
import { Spinner } from "../component/Spinner/Spinner";
import { VIFT } from "../assets/svgs/VIFT";

interface IOrderSummary {
  pcid: string;
  hideCashback?: boolean;
}

interface ICouponState {
  coupon: string;
  couponError: string;
}

interface IGCState {
  gcNum?: string;
  gcPin?: string;
  gcApplied?: boolean;
  gcVisible?: boolean;
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

  const [gcState, setgcState] = useState<IGCState>({
    gcNum: order?.userOptions.gcNum ? order.userOptions.gcNum[0] : "",
    gcPin: order?.userOptions.gcPin ? order.userOptions.gcPin[0] : "",
    gcError: "",
    gcVisible:
      order?.userOptions.gcNum && order?.userOptions?.gcNum[0] ? true : false,
    gcApplied:
      order?.userOptions.gcNum && order?.userOptions?.gcNum[0] ? true : false,
  });

  const [gcLoading, setGCLoading] = useState(false);

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

  // Toggle gift card visibility and reset gcApplied when hiding
  const handleApplyGiftCard = () => {
    setgcState((prevState) => ({
      ...prevState,
      gcVisible: !prevState.gcVisible,
      gcApplied: !prevState.gcVisible ? false : prevState.gcApplied, // Reset gcApplied when hiding
    }));
  };

  // Remove coupon from the list and update order.userOptions.coupons
  const handleRemoveCoupon = async (couponToRemove: string) => {
    if (order?.userOptions.coupons) {
      const { coupons } = order.userOptions;

      // Filter out the coupon to remove
      const updatedCoupons = coupons.filter(
        (appliedCoupon) => appliedCoupon !== couponToRemove
      );
      try {
        const updatedOrder = await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              coupons: updatedCoupons, // Update the coupons array
            },
          })
        );
        setOrder(updatedOrder.response?.success?.data);
      } catch (error) {
        console.error("Error while removing coupon:", error);
      }
    }
  };

  // Add gift card to the order
  const handleAddGiftCard = (isGCApplied: boolean) => {
    if (gcState.gcNum?.trim() === "") {
      setgcState((prevState) => ({
        ...prevState,
        gcError: "Please enter number",
      }));
    }

    if (gcState.gcPin?.trim() === "") {
      setgcState((prevState) => ({
        ...prevState,
        gcError: "Please enter pin",
      }));
    }
    if (order && isGCApplied) {
      setGCLoading(true);
      buildOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            gcPin: [],
            gcNum: [],
          },
        })
      )
        .then((response) => {
          if (response) {
            setgcState({
              gcNum: "",
              gcPin: "",
              gcError: "",
              gcApplied: false,
              gcVisible: false,
            });
            setOrder(response.response.success.data);
          }
        })
        .catch(() => {
          setgcState({
            ...gcState,
            gcError:
              "An unexpected error occurred while removing the gift card.",
          });
        })
        .finally(() => {
          setGCLoading(false);
        });
      return;
    }

    if (
      order?.userOptions &&
      gcState?.gcNum?.trim() &&
      gcState?.gcPin?.trim()
    ) {
      setGCLoading(true);

      changeOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            gcPin: [gcState?.gcPin],
            gcNum: [gcState?.gcNum],
          },
        }),
        order.id
      )
        .then((response) => {
          if (response.response.success?.notifications) {
            setgcState({
              ...gcState,
              gcError: response.response.success?.notifications[0]
                ?.reason as string,
            });
            console.warn(response.response.success.notifications);
            return;
          }

          if (response) {
            setgcState({
              ...gcState,
              gcError: "",
              gcApplied: true,
              gcVisible: true,
            });
            setOrder(response.response.success.data);
          }
        })
        .catch(() => {
          setgcState({
            ...gcState,
            gcError: "An unexpected error occurred while adding the gift card.",
          });
        })
        .finally(() => {
          setGCLoading(false);
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
      {gcLoading && <Spinner />}
      <>
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
                      <Close
                        onClick={() => handleRemoveCoupon(appliedCoupon)}
                      />
                    </li>
                  ))}
                </div>
              )}

            {gcState.gcVisible && (
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
                    />
                  </div>
                </div>
                <div className="gift-card-apply">
                  <Button
                    label={!!gcState.gcApplied ? "Remove" : "Apply"}
                    btnType="secondary"
                    onClick={() => handleAddGiftCard(!!gcState.gcApplied)}
                  />
                </div>
              </div>
            )}
            {!gcState.gcApplied && (
              <div
                className="order-sub-text underlined"
                onClick={handleApplyGiftCard}
              >
                {gcState.gcVisible ? "Hide Gift Card" : "Apply Gift Card"}
              </div>
            )}
          </>
        )}

        {storesTotals &&
          storesTotals
            .sort((storeA, storeB) => {
              return (storeB?.store?.isMA ?? 0) - (storeA?.store?.isMA ?? 0);
            })
            .map((store, index) => {
              const isFirst = index === 0;
              const isLast = index === storesTotals.length - 1;
              if (!store.totals) return null;
              return (
                <div
                  className={`order-charges-table ${
                    isFirst ? "order-charges-table-first" : ""
                  } ${isLast ? "order-charges-table-last" : ""}`}
                  key={store?.id || index}
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
              VIFT
              <span className="order-summary-row-green checked">{` Cashback`}</span>
            </div>
            <div className={order?.userOptions.applyEWallet ? "checked" : ""}>
              {order.totals?.walletAppliedStr}
            </div>
          </div>
        )}

        {order?.totals?.gcApplied && order?.totals?.gcApplied < 0 ? (
          <div className="order-summary-row">
            <div className="order-summary-row-bold">Gift Card</div>
            <div>{order?.totals.gcAppliedStr}</div>
          </div>
        ) : null}

        <div className="order-summary-total">
          <div>Total Due</div>
          <div>{order?.totals?.priceStr}</div>
        </div>
        {Number(order?.totals?.cashBack) > 0 && (
          <>
            <div className="order-summary-cashback-container">
              <div className="order-cashback">
                <Cashback />
                <span className="order-vift-cashback-earned">
                  VIFT Cashback earned in this order
                </span>
              </div>
              <div>{`${order?.totals.cashBackStr}`}</div>
            </div>
          </>
        )}

        {order?.totals?.extraCashBack && order?.totals?.extraCashBack > 0 ? (
          <>
            <div className="order-summary-cashback-container">
              <div className="order-cashback">
                <VIFT />
                You earned 1% extra Cash using VIFT
              </div>
              <div>{`$${formattedNumber(order.totals.extraCashBack)}`}</div>
            </div>
          </>
        ) : null}

        {order?.totals?.cashBack &&
        order?.totals?.extraCashBack &&
        order?.totals?.extraCashBack > 0 ? (
          <>
            <div className="order-summary-cashback-container">
              <div className="order-cashback">
                <VIFT />
                Total Cash added to your VIFT
              </div>
              <div>{`$${formattedNumber(
                order?.totals?.extraCashBack + order?.totals?.cashBack
              )}`}</div>
            </div>
          </>
        ) : null}

        {order?.stores && (
          <div className="shipping-item-container">
            {Object.entries(order?.stores).map(([key, store]) => {
              if (store.totals.ibv > 0 || store.totals.bv > 0) {
                return (
                  store && (
                    <div className="order-summary-cashback-container">
                      <div className="order-cashback">
                        {store?.store?.isMA === 1
                          ? `BV earned in this order`
                          : `IBV earned in this order`}
                      </div>
                      <div>
                        {store?.store?.isMA === 1
                          ? formattedNumber(store.totals.bv)
                          : formattedNumber(store.totals.ibv)}
                      </div>
                    </div>
                  )
                );
              }
            })}
          </div>
        )}
      </>
    </div>
  );
};
