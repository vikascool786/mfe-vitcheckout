import { useAtom } from "jotai";
import React from "react";
import { EWallet } from "../../interfaces/EWallet";
import { orderData, total } from "../../store";
import "../OrderSummary.scss";

interface IApplyCashbackContainer {
  cashbackData: EWallet;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({
  cashbackData,
}) => {
  const [order, setOrder] = useAtom(orderData);
  const [totalData, setTotal] = useAtom(total);

  const handleAddApplyCashback = () => {
    // Determine if cashback is being applied or removed
    const isCashbackApplied = !order?.userOptions.applyCashback;
  
    // Amount of cashback to be deducted (if applied) or added back (if removed)
    const previousCashback = order?.userOptions.applyCashback ? cashbackData.cashbackAvail || 0 : 0;
    const cashbackToDeduct = isCashbackApplied ? cashbackData.cashbackAvail || 0 : 0;
  
    // Recalculate the total price
    const updatedPrice = totalData?.price
      ? +(totalData.price + previousCashback - cashbackToDeduct).toFixed(2)
      : +(0 - cashbackToDeduct).toFixed(2); // Handle case when totalData.price is undefined
  
    // Update the order and totals
    setOrder({
      ...order,
      userOptions: {
        ...order.userOptions,
        applyCashback: isCashbackApplied,
      },
    });
  
    setTotal({
      ...totalData,
      price: updatedPrice,
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
