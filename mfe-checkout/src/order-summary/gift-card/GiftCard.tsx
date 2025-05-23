import React from "react";
import { Close } from "../../assets/svgs/Close";

interface GiftCardDisplayItemProps {
  order: any;
  index: number;
  gcDispApplied: string;
  handleAddGiftCard: (isRemove: boolean, index: number) => void;
}

export const GiftCardDisplayItem: React.FC<GiftCardDisplayItemProps> = ({
  handleAddGiftCard,
  gcDispApplied,
  index,
  order,
}) => {
  return (
    <div className="gcApplied">
      <div className="gcLeft-cont">
        <p className="cardName">{`Card: ${order.userOptions.gcNum[index]}`}</p>
        <p className="balanceCard">{`${order.totals.gcBalanceStr[index]} Balance`}</p>
      </div>
      <div className="gcRight-cont">
        <p className="appliedCash">{`${gcDispApplied} Applied`}</p>

        <Close onClick={() => handleAddGiftCard(true, index)} />
      </div>
    </div>
  );
};
