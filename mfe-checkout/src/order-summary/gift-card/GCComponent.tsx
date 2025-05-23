import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Button } from "../../component/Button/Button";
import { FormField } from "../../component/Form/Field/FormField";
import { loadingAtom, orderAtom, orderNotificationsAtom } from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { buildOrder } from "../../api/service/Order";
import { Spinner } from "../../component/Spinner/Spinner";
import { GiftCardDisplayItem } from "./GiftCard";
import { IPaymentMethod } from "../../interfaces/ShopperCart";

interface IGCState {
  gcNum?: string;
  gcPin?: string;
  gcApplied?: boolean;
  gcVisible?: boolean;
  gcError: string;
}

interface GiftCardComponentProps {
  order: any; // Replace 'any' with your Order interface type
  setOrder: (order: any) => void; // Replace 'any' with your Order interface type
}

export const GiftCardComponent: React.FC<GiftCardComponentProps> = ({
  order,
  setOrder,
}) => {
  const [gcState, setGcState] = useState<IGCState>({
    gcNum: "",
    gcPin: "",
    gcError: "",
    gcVisible:
      order?.userOptions.gcNum && order?.userOptions?.gcNum[0] ? true : false,
    gcApplied:
      order?.userOptions.gcNum && order?.userOptions?.gcNum[0] ? true : false,
  });

  const [gcLoading, setGcLoading] = useState(false);
  const [notificationMessages, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );


    // not to send payment method id if Gift card covers whole order 
    useEffect(() => {
      if (order?.totals?.price == 0) {
  
        const handlePaymentOnGCCover = async () => {
          try {
  
            const { id: _, ...pmId } = order?.paymentMethod || {};
          
            const updatedOrder = await buildOrder(
              generateChangeStoreResponse({
                ...order,
                paymentMethod: pmId  as IPaymentMethod,
              })
            );
            setOrder(updatedOrder.response?.success?.data);
          } catch (error) {
            console.error("Error while adding gift card:", error);
          } finally {
            setGcLoading(false);
          }
        };
  
        handlePaymentOnGCCover();
      }
    }, [order?.totals?.price]);

  // Handle input changes for gift card fields
  const handleGcNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGcState((prevState) => ({
      ...prevState,
      gcNum: e.target.value,
      gcError: "", // Clear error on input change
    }));
  };

  const handleGcPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGcState((prevState) => ({
      ...prevState,
      gcPin: e.target.value,
      gcError: "", // Clear error on input change
    }));
  };

  // Toggle gift card visibility and reset gcApplied when hiding
  const handleApplyGiftCard = () => {
    setGcState((prevState) => ({
      ...prevState,
      gcVisible: !prevState.gcVisible,
      gcApplied: !prevState.gcVisible ? false : prevState.gcApplied, // Reset gcApplied when hiding
    }));
  };

  // Add/remove gift card to/from the order
  const handleAddGiftCard = async (isGCApplied: boolean, index?: number) => {
    if (!order) return;

    const isApplyingGiftCard = !isGCApplied;

    if (isApplyingGiftCard && order.totals.price === 0) {
      const msg =
        "Your order balance is already $0.00. You cannot apply gift card to your order";

      if (!notificationMessages?.includes(msg)) {
        setOrderNotifications([...(notificationMessages || []), msg]);
      }

      setOrder({
        ...order,
        userOptions: {
          ...order.userOptions,
          gcNum: [...order.userOptions.gcNum],
          gcPin: [...order.userOptions.gcPin],
        },
      });

      return;
    }

    // === If removing gift card ===
    if (!isApplyingGiftCard) {
      try {
        const updatedOrder = await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              gcNum: [
                ...order.userOptions.gcNum.filter(
                  (_: any, i: number | undefined) => i !== index
                ),
              ],
              gcPin: [
                ...order.userOptions.gcPin.filter(
                  (_: any, i: number | undefined) => i !== index
                ),
              ],
            },
          })
        );

        setGcState((prevState) => ({
          ...prevState,
          gcNum: "",
          gcError: "",
          gcPin: "",
          gcVisible: false,
          gcApplied: false,
        }));

        setOrder(updatedOrder.response?.success?.data);
        setGcLoading(false);
        return;
      } catch (error) {
        console.error("Error while removing gift card:", error);
      }
    }

    // === If applying gift card ===
    if (!gcState.gcNum?.trim()) {
      setGcState((prevState) => ({
        ...prevState,
        gcError: "Please enter number",
      }));
      return;
    }

    if (!gcState.gcPin?.trim()) {
      setGcState((prevState) => ({
        ...prevState,
        gcError: "Please enter pin",
      }));
      return;
    }

    setGcLoading(true);

    try {
      const updatedOrder = await buildOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            gcNum: [...(order.userOptions.gcNum || []), gcState.gcNum],
            gcPin: [...(order.userOptions.gcPin || []), gcState.gcPin],
          },
        })
      );

      const notifications = updatedOrder.response.success.notifications;

      if (notifications && notifications.length > 0) {
        setGcState((prevState) => ({
          ...prevState,
          gcError: notifications[0]?.reason || "Gift card error",
          gcVisible: true,
          gcApplied: false,
        }));

        await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              gcNum: [],
              gcPin: [],
            },
          })
        );

        return;
      }

      setOrder(updatedOrder.response?.success?.data);
      setGcState((prevState) => ({
        ...prevState,
        gcNum: "",
        gcError: "",
        gcPin: "",
        gcVisible: false,
        gcApplied: false,
      }));
    } catch (error) {
      console.error("Error while adding gift card:", error);
      setGcState((prevState) => ({
        ...prevState,
        gcError: "An unexpected error occurred while adding the gift card.",
      }));
    } finally {
      setGcLoading(false);
    }
  };

  return (
    <>
      {gcLoading && <Spinner />}

      {gcState.gcVisible && (
        <div className="qa-order-gift gift-card-wrapper">
          <div className="gift-card-wrapper-fields">
            <div className="gift-card-wrapper-field-1">
              <div className="order-redeem-coupon-text">Gift Card Number</div>
              <FormField
                qaTag={"qa-card-number"}
                value={gcState.gcNum}
                onChange={handleGcNumChange}
              />
            </div>
            <div className="gift-card-wrapper-field-2">
              <div className="order-redeem-coupon-text">PIN</div>
              <FormField
                qaTag={"qa-input"}
                disablePasswordManager
                value={gcState.gcPin}
                onChange={handleGcPinChange}
              />
            </div>
          </div>

          <div className="gift-card-apply">
            <Button
              qaTag={"qa-button"}
              label="Apply"
              btnType="secondary"
              onClick={() => handleAddGiftCard(false)}
            />
          </div>
        </div>
      )}

      {order?.totals.gcDispAppliedStr &&
        order?.totals?.gcBalanceStr &&
        order.totals.gcDispAppliedStr.map(
          (gcDispApplied: string, index: number) => (
            <GiftCardDisplayItem
              key={gcDispApplied}
              gcDispApplied={gcDispApplied}
              handleAddGiftCard={handleAddGiftCard}
              index={index}
              order={order}
            />
          )
        )}

      {gcState.gcError && gcState.gcVisible && (
        <div className="error-message">{gcState.gcError}</div>
      )}

      {order?.totals.walletAppliedStr !== order?.totals.priceActualStr && (
        <div
          className="qa-link order-sub-text underlined"
          onClick={handleApplyGiftCard}
        >
          {gcState.gcVisible ? "Hide Gift Card" : "Apply Gift Card"}
        </div>
      )}
    </>
  );
};
