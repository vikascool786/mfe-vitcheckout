import { useAtom } from "jotai";
import React from "react";
import { changeOrder } from "../../api/service/Order";
import { VIFT } from "../../assets/svgs/VIFT";
import { siteApiData } from "../../checkout/siteAtom";
import { EWallet } from "../../interfaces/EWallet";
import { loadingAtom, orderAtom, orderNotificationsAtom } from "../../store";
import { getFormattedPrice } from "../../utils/helpers/CurrencyFormatterUtil";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { getOrderNotifications } from "../../utils/OrderUtils";
import "../OrderSummary.scss";

interface IApplyCashbackContainer {
  cashbackData: EWallet;
  siteId: string;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({
  cashbackData,
  siteId,
}) => {
  const [order, setOrder] = useAtom(orderAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [notificationMessages, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );

  const [siteData] = useAtom(siteApiData(siteId));

  const handleAddApplyCashback = () => {
    if (!order) return;
  
    const isApplyingCashback = !order.userOptions.applyEWallet;
  
    // Prevent applying if order total is already $0.00
    if (
      isApplyingCashback &&
      order.totals.price === 0
    ) {
      const msg = "Your order balance is already $0.00. You cannot apply VIFT to your order";
  
      if (!notificationMessages?.includes(msg)) {
        setOrderNotifications([
          ...(notificationMessages || []).filter((m) => m !== msg),
          msg,
        ]);
      }
  
      // Ensure cashback is not applied
      setOrder({
        ...order,
        userOptions: {
          ...order.userOptions,
          applyEWallet: false,
        },
      });
  
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    changeOrder(
      generateChangeStoreResponse({
        ...order,
        userOptions: {
          ...order.userOptions,
          applyEWallet: isApplyingCashback,
        },
      }),
      order.id
    ).then((response) => {
      if (response) {
        setOrder(response.response.success.data);
        setOrderNotifications(getOrderNotifications(response.response.success));
        setLoading(false);
      }
    });
  };

  return (
    <div className="GiftCard-container-apply-giftcard">
      <p className="Top-Text-v-Vard-apply">Pay with VIFT Cashback Balance</p>
      <div
        className={
          order?.userOptions.applyEWallet
            ? "Inner-Apply-vcard-Container checkedCont"
            : "Inner-Apply-vcard-Container"
        }
      >
        <div className="left-part-middle-container">
          <div className={order?.userOptions.applyEWallet ? "image-border-container" : "image-border-container notselected" }>
          {order?.userOptions.applyEWallet ?
            <VIFT /> : <VIFT />}
          </div>
          <p
            className={
              order?.userOptions.applyEWallet
                ? "Discount-price-text checked"
                : "Discount-price-text"
            }
          >
            {getFormattedPrice(siteData, cashbackData.totalCoaCBAvail)}
          </p>
        </div>
        <div className="Right-part-middle-container">
          <p className="Right-text-part">
            {order?.userOptions.applyEWallet ? "Applied" : "Not Applied"}
          </p>
          <input
            type="checkbox"
            className="checkbox"
            checked={order?.userOptions?.applyEWallet}
            onChange={handleAddApplyCashback} // Attach the click handler
          />
        </div>
      </div>
      <p className="Bottom-Text-v-Vard-apply">
        Earn an extra 1% cash when using your VIFT balance for your entire order
      </p>
    </div>
  );
};
