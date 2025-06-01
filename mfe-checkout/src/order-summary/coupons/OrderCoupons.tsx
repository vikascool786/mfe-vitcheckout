import React, { useEffect, useState } from "react";
import { Order } from "../../interfaces/Order";
import { buildOrder, changeOrder } from "../../api/service/Order";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { ShopperAttribute } from "../../interfaces/ShopperAttribute";
import { fetchShopperAttributes } from "../../api/service/ShopperDetail";
import { getOrderValidatePromoCode } from "../../api/service/PromoCodeAPI";
import { FormField } from "../../component/Form/Field/FormField";
import { Button } from "../../component/Button/Button";
import AppliedCoupons from "./AppliedCoupons";

interface ICouponState {
  coupon: string;
  couponError: string;
}

interface OrderCouponsProps {
  cartId: string;
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  shopperId: string;
}

const OrderCoupons: React.FC<OrderCouponsProps> = ({
  cartId,
  order,
  setOrder,
  isLoading,
  setIsLoading,
  shopperId,
}) => {
  const [coupon, setCoupon] = useState<ICouponState>({
    coupon: "",
    couponError: "",
  });

  const handleCouponTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCoupon((prev) => ({
      ...prev,
      coupon: value,
      couponError: value.trim() === "" ? "" : prev.couponError,
    }));
  };

  const handleRemoveCoupon = async (couponToRemove: string) => {
    if (order?.userOptions.coupons) {
      const updatedCoupons = order.userOptions.coupons.filter(
        (appliedCoupon) => appliedCoupon !== couponToRemove
      );
      try {
        setIsLoading(true);
        const updatedOrder = await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              coupons: updatedCoupons,
              gcNum: [],
              gcPin: [],
            },
          })
        );
        setOrder(updatedOrder.response?.success?.data);
      } catch (error) {
        console.error("Error while removing coupon:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddCoupon = async () => {
    try {
      const trimmedCoupon = coupon.coupon.trim();
      if (!trimmedCoupon) {
        setCoupon({
          coupon: "",
          couponError: "Please enter coupon",
        });
        return;
      }

      const { coupons = [] } = order.userOptions || {};
      if (coupons.includes(trimmedCoupon)) return;

      setIsLoading(true);
      const response = await changeOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            coupons: [...coupons, trimmedCoupon],
          },
        }),
        order.id
      );

      const notifications = response.response.success?.notifications;
      if (notifications?.length > 0) {
        setCoupon({
          coupon: trimmedCoupon,
          couponError: notifications[0]?.reason || "",
        });
      } else {
        setOrder(response.response.success?.data);
        setCoupon({ coupon: "", couponError: "" });
      }
    } catch (error) {
      console.error("Error while adding coupon:", error);
      setCoupon({
        coupon: coupon.coupon,
        couponError: "An unexpected error occurred while adding the coupon.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const applySurveyCoupon = async () => {
      try {
        const COUPON_CODE_SURVEY10 = "SURVEY10";
        const response: ShopperAttribute[] = await fetchShopperAttributes(shopperId);
        const hasTakenHealthSurvey = response.some(
          (entry) => entry.typeId === 609 && entry.value === 1
        );

        if (!hasTakenHealthSurvey) return;

        const couponResp = await getOrderValidatePromoCode(
          cartId,
          COUPON_CODE_SURVEY10,
          order?.totals?.price || 0
        );

        const canRedeem =
          couponResp?.isCouponValid === "1" &&
          (couponResp?.svrMessage?.length ?? 0) <= 0;

        if (
          canRedeem &&
          !order?.userOptions?.coupons?.includes(COUPON_CODE_SURVEY10)
        ) {
          const updatedCoupons = [
            ...(order.userOptions?.coupons ?? []),
            COUPON_CODE_SURVEY10,
          ];
          const updatedOrder = await buildOrder(
            generateChangeStoreResponse({
              ...order,
              userOptions: {
                ...order.userOptions,
                coupons: updatedCoupons,
              },
            })
          );
          setOrder(updatedOrder.response?.success?.data);
        }
      } catch (error) {
        console.error("Coupon auto-apply failed:", error);
      }
    };

    applySurveyCoupon();
  }, [cartId, order, setOrder, shopperId]);

  return (
    <>
      <div className="order-redeem-coupon-text">Redeem Coupon</div>
      <div className="qa-order-coupon order-summary-coupon-container">
        <div className="order-input-container">
          <FormField
            qaTag="qa-input"
            value={coupon.coupon}
            onChange={handleCouponTextChange}
            errorMessage={coupon.couponError}
          />
        </div>
        <div className="order-apply-container">
          <Button
            qaTag="qa-button"
            label="Apply"
            btnType="secondary"
            onClick={handleAddCoupon}
          />
        </div>
      </div>
      {order?.userOptions?.coupons?.length > 0 && (
        <div className="order-applied-coupons">
          <AppliedCoupons
            stores={order?.stores}
            handleRemoveCoupon={handleRemoveCoupon}
          />
        </div>
      )}
    </>
  );
};

export default OrderCoupons;