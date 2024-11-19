import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import ProductImage from "../assets/images/ProductImage.png";
import { Item } from "../interfaces/ShippingMethod";

interface IProduct {
  imageUrl: string;
  name: string;
  description: string;
  cashback: string;
  price: string;
  quantity: number;
}

interface IShippingItemProps {
  product: Item;
}

export const ShippingItem: React.FC<IShippingItemProps> = ({ product }) => {
  const { image, caption ,  catalogName, totals, quantity } = product;
  return (
    <div className="item-container">
      <div className="item-detail-container">
        <img className="item-image" src={image.url} />
        <div className="item-info">
          <div className="item-name">{caption}</div>
          <div>{catalogName}</div>
          <div className="item-cashback">
            <div className="item-cashback-value">+ ${totals.cashBack}</div>
            <Cashback viewBox="0 -2 24 22" />
            Cashback
          </div>
          <div>${totals.price}</div>
        </div>
      </div>
      <div className="item-cancel">
        <Close />
        Quantity: {quantity}
      </div>
    </div>
  );
};
