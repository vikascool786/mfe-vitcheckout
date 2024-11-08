import React from "react";
import { Labels } from "../../utils/types/types";
import "./ProductMetaTag.scss";

interface ProductMetaTagProps {
  label: Labels;
}
const ProductMetaTag: React.FC<ProductMetaTagProps> = ({ label }) => {
  return (
    <div className="product-meta-tag-container">
      <div key={label.type} className="product-meta-tag">
        {label.name}
      </div>
    </div>
  );
};
export default ProductMetaTag;
