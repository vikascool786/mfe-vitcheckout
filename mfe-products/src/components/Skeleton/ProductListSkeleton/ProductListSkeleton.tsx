import React from "react";
import "./ProductListSkeleton.scss";

interface ProductListSkeletonProps {
  NumberOfTimesTobeRendered: number;
}
const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({
  NumberOfTimesTobeRendered,
}) => {
  const ProductListSkeletonTimesToBeLoaded = Array.from(
    { length: NumberOfTimesTobeRendered },
    (_, index) => index + 1
  );

  return (
    <div className="product-list-skeleton-list-container">
      {ProductListSkeletonTimesToBeLoaded?.map((item, index) => {
        return (
          <div key={index} className="product-list-skeleton-item">
            <div className="product-list-skeleton">
              <div className="product-list-skeleton-image"></div>
              <div className="product-list-skeleton-line"></div>
              <div className="product-list-skeleton-line small"></div>
              <div className="product-list-skeleton-two"></div>
              <div className="product-list-skeleton-three"></div>
              <div className="product-list-skeleton-line small"></div>
            </div>
            <hr className="product-list-skeleton-divider" />
          </div>
        );
      })}
    </div>
  );
};

export default ProductListSkeleton;
