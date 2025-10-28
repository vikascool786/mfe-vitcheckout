import { useAtom } from "jotai";
import React from "react";
import { EWallet } from "../../interfaces/EWallet";
import "../OrderSummary.scss";
import { loadingAtom, orderAtom, orderNotificationsAtom } from "../../store";
import { changeOrder } from "../../api/service/Order";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { VIFT } from "../../assets/svgs/VIFT";
import { VIFTinit } from "../../assets/svgs/VIFTinit";
import { getOrderNotifications } from "../../utils/OrderUtils";
import { siteApiData } from "../../checkout/siteAtom";
import { getFormattedPrice } from "../../utils/helpers/CurrencyFormatterUtil";
import { useContentStrings } from "../../hooks/useContentStrings";

interface IApplyCashbackContainer {
  cashbackData: EWallet;
  siteId: string;
  pcid: string;
  setPaymentTypeId: (id: number) => void;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({
  cashbackData,
  siteId,
  pcid,
  setPaymentTypeId,
}) => {
  const [order, setOrder] = useAtom(orderAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [notificationMessages, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const { getString } = useContentStrings();
  const [siteData] = useAtom(siteApiData(siteId));

  const handleAddApplyCashback = () => {
    if (!order) return;
  
    const isApplyingCashback = !order.userOptions.applyEWallet;
  
    // Prevent applying if order total is already $0.00
    if (
      isApplyingCashback &&
      order.totals.price === 0
    ) {
      const msg = getString("zeroOrderBalance") as string;
  
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
      }, pcid),
      order.id
    ).then((response) => {
      if (response) {
        setOrder(response.response.success.data);
        setOrderNotifications(getOrderNotifications(response.response.success));
        // if price is 0 after applying cashback, set payment type to VIFT
        if (response.response.success.data.totals.price === 0) {
           setPaymentTypeId(6);
        }
        setLoading(false);
      }
    });
  };

  return (
    <div className="GiftCard-container-apply-giftcard">
      <p className="Top-Text-v-Vard-apply">{getString('payWithVIFTBalance')}</p>
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
            {order?.userOptions.applyEWallet ? getString('applied') : getString('notApplied')}
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
        {getString('earnExtra1PercentVIFT')}
      </p>
    </div>
  );
};
