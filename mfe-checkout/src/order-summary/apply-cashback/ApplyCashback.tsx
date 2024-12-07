import { useAtom } from "jotai";
import React from "react";
import { EWallet } from "../../interfaces/EWallet";
import "../OrderSummary.scss";
import { orderAtom } from "../../store";

interface IApplyCashbackContainer {
  cashbackData: EWallet;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({
  cashbackData,
}) => {
  const [order, setOrder] = useAtom(orderAtom);

  console.log(order)

  const handleAddApplyCashback = () => {
    // Determine if cashback is being applied or removed
    const isCashbackApplied = !order?.userOptions.applyCashback;

    setOrder({
      ...order,
      userOptions: {
        ...order.userOptions,
        applyCashback: isCashbackApplied,
      },
    });
  };

  return (
    <div className="order-apply-cashback-container">
      <span className="order-apply-cashback-container-cb-text">
        Apply your VIFT Cashback
      </span>
      <span className="order-apply-cashback-container-cb-italic-text">
        Earn an extra 1% cash when using VIFT wallet for your entire order.
      </span>
      <div className="order-apply-cashback-container-cb-bold">
        <input
          className="checkbox"
          type="checkbox"
          checked={order?.userOptions?.applyCashback}
          onChange={handleAddApplyCashback}
        />
        {`$${cashbackData.cashbackAvail} - Use VIFT Cashback on this order`}
      </div>
    </div>
  );
};
