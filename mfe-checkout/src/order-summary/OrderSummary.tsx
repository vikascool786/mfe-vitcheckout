import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { buildOrder, changeOrder } from "../api/service/Order";
import { useShopperEWallet } from "../api/service/ShopperEWallet";
import { Cashback } from "../assets/svgs/Cashback";
import { Button } from "../component/Button/Button";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { loadingAtom, orderAtom, orderNotificationsAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import { ApplyCashback } from "./apply-cashback/ApplyCashback";
import "./OrderSummary.scss";
import { formattedNumber } from "../utils/OrderUtils";
import { Spinner } from "../component/Spinner/Spinner";
import { VIFT } from "../assets/svgs/VIFT";
import { fetchShopperAttributes } from "../api/service/ShopperDetail";
import { ShopperAttribute } from "../interfaces/ShopperAttribute";
import { getOrderValidatePromoCode } from "../api/service/PromoCodeAPI";
import { portalApiData } from "../checkout/portalAtom";
import { getCouponAliasForCouponCode, isHiddenCouponCode } from "../utils/CouponUtils";
import StoreHeading from "../component/StoreHeading";
import { GET_API_MODE } from "../utils/helpers/urlResolvers";
import { GiftCardComponent } from "./gift-card/GCComponent";
import { IPaymentMethod } from "../interfaces/ShopperCart";
import AppliedCoupons from "./AppliedCoupons";

interface IOrderSummary {
  pcid: string;
  shopperId: string;
  hideCashback?: boolean;
  cartId: string;
  siteId: string;
  isAddressSaved: boolean;
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
  shopperId,
  cartId,
  siteId,
  isAddressSaved,
}) => {
  const [order, setOrder] = useAtom(orderAtom);
  const { eWalletData, loading, error } = useShopperEWallet(pcid);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const [notificationMessages, setOrderNotifications] = useAtom(
      orderNotificationsAtom
  );
  const [coupon, setCoupon] = useState<ICouponState>({
    coupon: "",
    couponError: "",
  });

  const [portalData] = useAtom(portalApiData(shopperId));
  const apiMode = GET_API_MODE();

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

  // Remove coupon from the list and update order.userOptions.coupons
  const handleRemoveCoupon = async (couponToRemove: string) => {
    if (order?.userOptions.coupons) {
      const { coupons } = order.userOptions;

      // Filter out the coupon to remove
      const updatedCoupons = coupons.filter(
        (appliedCoupon) => appliedCoupon !== couponToRemove
      );

      try {
        setIsLoading(true);
        const updatedOrder = await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              coupons: updatedCoupons, // Update the coupons array
              gcNum: [], // Reset gift card number
              gcPin: [], // Reset gift card pin
            },
          })
        );

        setOrder(updatedOrder.response?.success?.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error while removing coupon:", error);
      }
    }
  };

  const handleAddCoupon = async () => {
    try {
      if (coupon.coupon) {
        if (order) {
          const { coupons } = order?.userOptions || {};
          const trimmedCoupon = coupon.coupon.trim();

          if (trimmedCoupon && (!coupons || !coupons.includes(trimmedCoupon))) {
            // Create a new coupons array with the new coupon
            const updatedCoupons = coupons
              ? [...coupons, trimmedCoupon]
              : [trimmedCoupon];

            setIsLoading(true);
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

            if (response.response.success?.notifications.length > 0) {
              setIsLoading(false);
              setCoupon({
                coupon: coupon.coupon,
                couponError: response.response.success?.notifications[0]
                  ?.reason as string,
              });
              return;
            }

            setOrder(response.response.success?.data);
            setIsLoading(false);
            setCoupon({
              coupon: "",
              couponError: "",
            });
          }
        }
      } else {
        setIsLoading(false);
        setCoupon({
          coupon: "",
          couponError: "Please enter coupon",
        });
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
    Object.entries(order?.stores).map(([key, store]) => ({
      key,
      store,
    }));

  useEffect(() => {
    fetchShopperAttributes(shopperId)
      .then((response: ShopperAttribute[]) => {
        const COUPON_CODE_SURVEY10 = "SURVEY10";
        const hasTakenHealthSurvey = response.some(
          (entry) => entry.typeId === 609 && entry.value === 1
        );
        if (hasTakenHealthSurvey) {
          //check if coupon has been redeemed
          getOrderValidatePromoCode(
            cartId,
            COUPON_CODE_SURVEY10,
            order?.totals?.price || 0
          )
            .then((response) => {
              const canRedeem =
                response &&
                response?.isCouponValid === "1" &&
                (response?.svrMessage?.length ?? 0) <= 0;
              if (canRedeem) {
                //apply coupon to order
                if (
                  order &&
                  !order?.userOptions?.coupons?.includes(COUPON_CODE_SURVEY10)
                ) {
                  const updatedCoupons = [
                    ...(order?.userOptions?.coupons ?? []),
                    COUPON_CODE_SURVEY10,
                  ];
                  const updatedOrder = buildOrder(
                    generateChangeStoreResponse({
                      ...order,
                      userOptions: {
                        ...order.userOptions,
                        coupons: updatedCoupons,
                      },
                    })
                  );
                  updatedOrder
                    .then((response) => {
                      setOrder(response.response?.success?.data);
                    })
                    .catch((error) => {
                      console.error("Error updating order with coupon ", error);
                    });
                }
              }
            })
            .catch((error) => {
              console.error("Error with getOrderValidatePromoCode", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error getting shopper attribute fetch", error);
      });
  }, []);

  return (
    <div
      className={`qa-order-summary order-summary-container ${
        apiMode === "localhost" ? "height-180" : "height-245"
      }`}
    >
      {isLoading && <Spinner />}
      <>
        <FormHeading title="Order Summary" />
        {!hideCashback && (
          <>
            {!loading &&
              !error &&
              eWalletData &&
              parseInt(eWalletData.totalCoaCBAvail) > 0 && (
                <ApplyCashback cashbackData={eWalletData} siteId={siteId} />
              )}
          </>
        )}

        <div className="order-redeem-coupon-text">Redeem Coupon</div>
        <div className="qa-order-coupon order-summary-coupon-container">
          <div className="order-input-container">
            <FormField
              qaTag={"qa-input"}
              value={coupon.coupon}
              onChange={handleCouponTextChange}
              errorMessage={coupon.couponError}
            />
          </div>
          <div className="order-apply-container">
            <Button
              qaTag={"qa-button"}
              label="Apply"
              btnType="secondary"
              onClick={handleAddCoupon}
            />
          </div>
        </div>
        {order?.userOptions.coupons &&
          order?.userOptions.coupons?.length > 0 && (
            <div className="order-applied-coupons">
                <AppliedCoupons stores={order?.stores} handleRemoveCoupon={handleRemoveCoupon} />
            </div>
          )}

        <GiftCardComponent order={order} setOrder={setOrder} />

        {storesTotals &&
          storesTotals
            .sort((storeA, storeB) => {
              return (
                (storeB?.store?.store?.isMA ?? 0) -
                (storeA?.store?.store?.isMA ?? 0)
              );
            })
            .map((store, index) => {
              const isLast = index === storesTotals.length - 1;
              if (!store?.store?.totals) return null;
              return (
                <div
                  className={`order-charges-table ${
                    isLast ? "order-charges-table-last" : ""
                  }`}
                  key={store.key || index}
                >
                  <StoreHeading
                    storeName={getCatalogName(store?.store) || ""}
                    storeKey={store?.key}
                    isMAStore={store?.store?.store?.isMA === 1}
                    order={order}
                    isOrderSummary={true}
                  />

                  <div className="order-summary-row">
                    <div>Items</div>
                    <div className={"qa-subtotal"}>
                      {store?.store?.totals?.priceStr}
                    </div>
                  </div>
                  {store?.store?.totals?.couponCode && (
                      <div className="order-summary-row order-summary-row__coupon">
                        <div className="order-summary-coupon-applied">
                          Coupon
                          <span
                              key={index}
                              className="order-summary-coupon-applied__code"
                          >
                            {isHiddenCouponCode(store?.store?.totals?.couponCode) ? (
                                <span>
                                {getCouponAliasForCouponCode(store?.store?.totals?.couponCode)}
                              </span>
                            ) : (
                                <span>
                                {store?.store?.totals?.couponCode}
                              </span>
                            )}
                          </span>
                        </div>

                        <div>{store?.store?.totals?.couponsStr}</div>
                      </div>
                  )}
                  <div className="order-summary-row">
                    <div>Tax</div>
                    <div className={"qa-tax"}>
                      {store?.store?.totals?.taxStr}
                    </div>
                  </div>

                  <div className="order-summary-row">
                    <div>
                      {" "}
                      {order.totals.shipping == 0
                        ? "Free Shipping"
                        : "Shipping"}{" "}
                    </div>
                    <div className={"qa-shipping"}>
                      {store?.store?.totals?.shippingStr}
                    </div>
                  </div>
                </div>
              );
            })}
        {order?.totals?.priceActualStr !== order?.totals.priceStr && (
          <div className="order-summary-row">
            <div className="order-summary-row">Subtotal</div>
            <div className={"qa-sub-totaltotal"}>
              {order?.totals?.priceActualStr}
            </div>
          </div>
        )}

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

        <div className={`order-summary-total ${
            order?.totals?.priceActualStr !== order?.totals.priceStr
              ? `order-summary-total-line`
              : ``
          } `}
        >
          <div>Total Due</div>
          <div className={"qa-total"}>{order?.totals?.priceStr}</div>
        </div>
        {Number(order?.totals?.cashBack) > 0 && (
          <>
            <div className="order-summary-cashback-container">
              <div className="order-cashback">
                <Cashback />
                <span className="order-vift-cashback-earned">
                  VIFT Cashback earned on this order
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
                <span className="vift-earned-cash">
                  You earned 1% extra Cash using VIFT
                </span>
              </div>
              <div className={"qa-cashback"}>{`$${formattedNumber(
                order.totals.extraCashBack
              )}`}</div>
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
                <span className="total-cash-added">
                Total Cash added to your VIFT balance
                </span>
              </div>
              <div>{`$${formattedNumber(
                order?.totals?.extraCashBack + order?.totals?.cashBack
              )}`}</div>
            </div>
          </>
        ) : null}

        {order?.totals?.bv !== undefined &&
          order?.totals?.bv !== null &&
          order?.totals?.bv > 0 && (
            <div className="shipping-item-container">
              <div className="order-summary-cashback-container">
                <div className="order-cashback">BV earned in this order</div>
                <div>{formattedNumber(order.totals.bv)}</div>
              </div>
            </div>
          )}
        {order?.totals?.ibv !== undefined &&
          order?.totals?.ibv !== null &&
          order?.totals?.ibv > 0 && (
            <div className="shipping-item-container">
              <div className="order-summary-cashback-container">
                <div className="order-cashback">IBV earned in this order</div>
                <div>{formattedNumber(order.totals.ibv)}</div>
              </div>
            </div>
          )}
      </>
    </div>
  );
};
