import React from "react";
import "../OrderSummary.scss";
import { EWallet } from "../../interfaces/EWallet";

interface IApplyCashbackContainer {
    cashbackData: EWallet;
}

export const ApplyCashback: React.FC<IApplyCashbackContainer> = ({cashbackData}) => {

  return (
    <div className="order-apply-cashback-container">
      <span className="order-apply-cashback-container-cb-text">
        Apply your VIFT Cashback
      </span>
      <span className="order-apply-cashback-container-cb-italic-text">
        Earn an extra 1% cash when using VIFT wallet for your entire order.
      </span>
      <div className="order-apply-cashback-container-cb-bold">
        <input className="checkbox" type="checkbox" />
        {`${cashbackData.cashbackAvail} - Use VIFT Cashback on this order`}
      </div>
    </div>
  );
};
