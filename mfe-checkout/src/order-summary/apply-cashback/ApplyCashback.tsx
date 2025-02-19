import { useAtom } from "jotai";
import React from "react";
import { EWallet } from "../../interfaces/EWallet";
import "../OrderSummary.scss";
import { orderAtom } from "../../store";
import { changeOrder } from "../../api/service/Order";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { VIFT } from "../../assets/svgs/VIFT";

interface IApplyCashbackContainer {
  cashbackData: EWallet;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({
  cashbackData,
}) => {
  const [order, setOrder] = useAtom(orderAtom);

  const handleAddApplyCashback = () => {
    // Determine if cashback is being applied or removed

    if (order) {
      const isCashbackApplied = !order?.userOptions.applyEWallet;

      changeOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order.userOptions,
            applyEWallet: isCashbackApplied,
          },
        }),
        order.id
      ).then((response) => {
        if (response) {
          setOrder(response.response.success.data);
        }
      });
    }
  };

  return (
    <div className="GiftCard-container-apply-giftcard">
      <p className="Top-Text-v-Vard-apply">Pay with VIFT Cashback Balance</p>
      <div className={order?.userOptions.applyEWallet ? "Inner-Apply-vcard-Container checkedCont" : "Inner-Apply-vcard-Container"}>
        <div className="left-part-middle-container">
          <div className="image-border-container">
            <VIFT />
          </div>
          <p className={order?.userOptions.applyEWallet ? "Discount-price-text checked" : "Discount-price-text"}>
            {`$${cashbackData.totalCoaCBAvail}`}
          </p>
        </div>
        <div className="Right-part-middle-container">
          <p className="Right-text-part">{order?.userOptions.applyEWallet ? "Applied" : "Not Applied"}</p>
          <input
            type="checkbox"
            className="checkbox"
            checked={order?.userOptions?.applyEWallet}
            onChange={handleAddApplyCashback} // Attach the click handler
          />
        </div>
      </div>
      <p className="Bottom-Text-v-Vard-apply">Earn an extra 1% cash when using VIFT balance for your entire order.</p>
    </div>
  );
};