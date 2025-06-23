import React from "react";
import { ProductSummaryItemProps } from "../types";

const ProductSummaryItem: React.FC<ProductSummaryItemProps> = ({
  subtotal,
  tax,
  shipping,
  cashback,
  total,
  image,
}) => {
  return (
    <div className="product-container">
      <img src={image} style={{ width: "8.32rem", height: "7.77rem" }} />
      <div className="product-price-container">
        <span className="product-name">Isotonix Calcium Plus</span>
        <span className="product-description">Single Bottle (90 Servings)</span>
        <span className="product-cashback">+ $0.52 Cashback</span>
        <span className="product-quantity">Quantity: 1</span>
      </div>
    </div>
  );
};

export default ProductSummaryItem;
