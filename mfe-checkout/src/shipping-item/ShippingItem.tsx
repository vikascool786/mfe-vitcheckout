import React from "react";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import ProductImage from "../assets/images/ProductImage.png";

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
          src={ProductImage}
        />
        <div className="item-info">
          <div className="item-name">{name}</div>
          <div>{description}</div>
          <div className="item-cashback">
            {cashback} <Cashback /> Cashback
          </div>
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
