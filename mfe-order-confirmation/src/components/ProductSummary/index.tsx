import React from "react";
import ProductSummaryItem from "./Item";
import "./styles.css";
import { ProductSummaryProps } from "./types";

const ProductSummary: React.FC<ProductSummaryProps> = ({ products }) => {
  return (
    <>
      {products.map((product, index) => (
        <div key={index}>
          <ProductSummaryItem {...product} />
        </div>
      ))}
    </>
  );
};

export default ProductSummary;
