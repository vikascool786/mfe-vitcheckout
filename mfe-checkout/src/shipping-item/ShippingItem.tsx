import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import { Item, StoreDetail } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";
import { Portal } from "../interfaces/Portal";
import { AutoshipIcon } from "../assets/icons/Autoship";
import { truncate } from "../utils/helpers/Helper";

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
  total: ITotal;
  onRemove: () => void;
  portalData: Portal;
  isMaProduct: boolean;
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
  portalData,
  isMaProduct,
}) => {
  const { image, caption, catalogName, totals, quantity } = item;
  const { catalogId, isMA } = storeDetail || {};
  const { bv, ibv } = item.totals;

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
          <div className="item-image">
            <img src={image.url} alt="Product" />
          </div>

          <div className="item-info">
            {/* first line */}
            <section className="header-section">
              <div className="header-block">
                <div className="item-name">{decodeHtmlEntities(caption)}</div>
              </div>

              <div onClick={onRemove}>
                <Close />
              </div>
            </section>

            <section className="item-cashback">
              {totals?.cashBack > 0 && (
                <>
                  <div className="item-cashback-value">
                    + {totals?.cashBackStr}
                  </div>
                  <Cashback viewBox="0 -2 24 22" />
                  Cashback{" "}
                </>
              )}{" "}
              {bv > 0 && isMA && isMA === 1
                ? ` ${formattedNumber(bv)} BV`
                : ibv > 0 && ` ${formattedNumber(ibv)} IBV`}
            </section>
            <section className="price-section">
              <div className="shippingItem-priceStr">{totals?.priceStr}</div>
              <div>Quantity: {quantity}</div>
            </section>

            {(item.autoshipFreq > 0 || item.autoShipId) &&
              (portalData?.autoShipDiscount > 0 &&
              isMaProduct &&
              item.hasAutoShipDiscount ? (
                <div className="item-autoship">
                  <AutoshipIcon />
                  Saving {portalData.autoShipDiscount}% with Autoship
                </div>
              ) : (
                <div className="item-autoship">
                  <AutoshipIcon />
                  Repeating with Autoship
                </div>
              ))}
            {item.autoshipFreq > 0 && (
              <div>
                Frequency:{" "}
                <span className="item-autoship-frequency">
                  {item.autoshipFreq} days
                </span>
              </div>
            )}
          </div>
        </div>
        {/* <div className="item-cancel" onClick={onRemove}>
          <Close />
          Quantity: {quantity}
        </div> */}
      </div>
      {/* Render options if they exist */}
      {isGiftCard && options && options.length > 0 && (
        <div className="item-options">
          <ul>
            {options.map(([key, value]) => (
              <div key={key} className="item-options__row">
                <strong>{key}</strong> {truncate(value, 200)}
              </div>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
