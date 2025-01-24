import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import { Item } from "../interfaces/ShippingMethod";
// import { it } from "node:test";

interface IProduct {
  imageUrl: string;
  name: string;
  description: string;
  cashback: string;
  price: string;
  quantity: number;
}

interface IShippingItemProps {
  item: Item;
  onRemove: () => void;
}

function createOptionMap(
  data: Array<{ optionStringValue: string; name: string; type: string }>
): Map<string, string> {
  const optionMap = new Map<string, string>();
  data.forEach((item) => {
    optionMap.set(item.name, item.optionStringValue);
  });
  return optionMap;
}

export const ShippingItem: React.FC<IShippingItemProps> = ({
  item,
  onRemove,
}) => {
  const { image, caption, catalogName, totals, quantity } = item;

  const isGiftCard = caption.toLowerCase().includes("email delivery");

  const options =
    item.option && Array.from(createOptionMap(item.option).entries()); // Convert Map entries to an array

  function decodeHtml(html: any) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  return (
    <>
      <div className="item-container">
        <div className="item-detail-container">
          <img className="item-image" src={image.url} alt="Product" />
          <div className="item-info">
            <div className="item-name">{decodeHtml(caption)}</div>
            <div>{catalogName}</div>
            <div className="item-cashback">
              <div className="item-cashback-value">+ {totals?.cashBackStr}</div>
              <Cashback viewBox="0 -2 24 22" />
              Cashback
            </div>
            <div>{totals?.priceStr}</div>
          </div>
        </div>
        <div className="item-cancel" onClick={onRemove}>
          <Close />
          Quantity: {quantity}
        </div>
      </div>
      {/* Render options if they exist */}
      {isGiftCard && options && options.length > 0 && (
        <div className="item-options">
          <ul>
            {options.map(([key, value]) => (
              <div key={key}>
                <strong>{key}</strong> {value}
              </div>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
