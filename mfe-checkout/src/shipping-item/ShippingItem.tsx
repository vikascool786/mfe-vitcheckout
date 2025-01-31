import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import { Item, StoreDetail } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";
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
  storeDetail: StoreDetail;
  total: ITotal
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

const formattedNumber = (num: any) => Number(num).toFixed(2);

export const ShippingItem: React.FC<IShippingItemProps> = ({
  item,
  storeDetail,
  total,
  onRemove,
}) => {
  const { image, caption, catalogName, totals, quantity } = item;
  const { catalogId, isMA } = storeDetail;
  const { bv, ibv } = total;

  console.log("catalogId, isMA", isMA === 1, bv, ibv);
  const isGiftCard = caption.toLowerCase().includes("email delivery");

  const options =
    item.option && Array.from(createOptionMap(item.option).entries()); // Convert Map entries to an array

  // remove html entities 
  const decodeHtmlEntities = (html: any) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <>
      <div className="item-container">
        <div className="item-detail-container">
          <img className="item-image" src={image.url} alt="Product" />
          <div className="item-info">
            <div className="item-name">{decodeHtmlEntities(caption)}</div>
            <div>{catalogName}</div>
            <div className="item-cashback">
              <div className="item-cashback-value">+ {totals?.cashBackStr}</div>
              <Cashback viewBox="0 -2 24 22" />
              Cashback / {isMA === 1 ? `${formattedNumber(bv)} BV` : `${formattedNumber(ibv)} IBV`}
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
