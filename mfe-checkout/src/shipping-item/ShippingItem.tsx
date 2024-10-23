import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";

interface IProduct {
  imageUrl: string;
  name: string;
  description: string;
  cashback: string;
  price: string;
  quantity: number;
}

interface IShippingItemProps {
  product: IProduct;
}

export const ShippingItem: React.FC<IShippingItemProps> = ({ product }) => {
  const { imageUrl, name, price, description, cashback, quantity } = product;
  return (
    <div className="item-container">
      <div className="item-detail-container">
        <img
          className="item-image"
          src={require("../assets/images/ProductImage.png")}
        />
        <div className="item-info">
          <div className="item-name">{name}</div>
          <div>{description}</div>
          <div>{cashback}</div>
          <div>{price}</div>
        </div>
      </div>
      <div className="item-cancel">
        <Close />
        Quantity: {quantity}
      </div>
    </div>
  );
};
