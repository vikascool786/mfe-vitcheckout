import React from "react";
import { Close } from "../assets/svgs/Close";
import { useContentStrings } from "../hooks/useContentStrings";

interface GiftCardProps {
  order: any;
  index: number;
  gcDispApplied: string;
  handleAddGiftCard: (isRemove: boolean, index: number) => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  handleAddGiftCard,
  gcDispApplied,
  index,
  order,
}) => {
  const { getString } = useContentStrings();
  return (
    <div className="gcApplied">
      <div className="gcLeft-cont">
        <p className="cardName">{`Card: ${order.userOptions.gcNum[index]}`}</p>
        <p className="balanceCard">{`${
          order.totals.gcBalanceStr[index]
        } ${getString("balance")}`}</p>
      </div>
      <div className="gcRight-cont">
        <p className="appliedCash">{`${gcDispApplied} ${getString('applied')}`}</p>

        <Close onClick={() => handleAddGiftCard(true, index)} />
      </div>
    </div>
  );
};
