import React, { useState } from "react";
import { useAtom } from "jotai";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import { Item, StoreDetail } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";
import { Portal } from "../interfaces/Portal";
import { AutoshipIcon } from "../assets/icons/Autoship";
import { truncate } from "../utils/helpers/Helper";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { DropdownOption } from "../interfaces/DropdownOption";
import { debounce } from "lodash";

import { orderAtom, orderNotificationsAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { updateProductQty } from "../api/service/Order";

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
  cartId: string;
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
  cartId,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(
    item.quantity.toString()
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [order, setOrder] = useAtom(orderAtom);

  const { image, caption, catalogName, totals, quantity } = item;
  const { catalogId, isMA } = storeDetail || {};
  const { bv, ibv } = item.totals;

  const isGiftCard = caption.toLowerCase().includes("email delivery");

  const options =
    item.option && Array.from(createOptionMap(item.option).entries());

  const decodeHtmlEntities = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const createQuantityOptions = (maxQuantity: number): DropdownOption[] => {
    return Array.from({ length: maxQuantity + 1 }, (_, i) => ({
      value: i.toString(),
      label: i === 0 ? "0 (Delete)" : i.toString(),
    }));
  };

  const handleQuantityChange = async (value: string) => {
    setSelectedQuantity(value);
    if (value === "0") {
      onRemove();
      return;
    } else {
      onQuantityChange(item, parseInt(value));
    }
  };

  const onQuantityChange = debounce(async (item: Item, newQuantity: number) => {
    let requestData = {
      id: cartId,
      products: [
        {
          id: item.prodId,
          type: "PROD",
          quantity: newQuantity,
          option: item.option,
          product_hash: item.product_hash,
        },
      ],
    };

    console.log("requestData", requestData);

    try {
      setIsUpdating(true);
      const response = await updateProductQty(cartId, requestData);
      console.log("=======requestData", response);
      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 500);

  // Default max quantity - adjust as needed based on your requirements
  const maxAvailableStock = 30;
  const quantityOptions = createQuantityOptions(maxAvailableStock);

  return (
    <>
      <div className="item-container">
        <div className="item-detail-container">
          <div className="item-image">
            <img src={image.url} alt={caption} />
          </div>

          <div className="item-info">
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
              <div className="quantity-selector">
                <p>Quantity</p>
                <div className="quantity-dropdown-container">
                  <DropdownField
                    className="form-field"
                    formName={`quantity-${catalogName}`}
                    selectedValue={selectedQuantity}
                    options={quantityOptions}
                    onChange={handleQuantityChange}
                    errorMessage={updateError}
                    disabled={isUpdating}
                  />
                </div>
                {isUpdating && (
                  <span className="updating-message">Updating...</span>
                )}
              </div>
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
      </div>

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
