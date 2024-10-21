import React from "react";
import "./ProductStoreSkeleton.scss";

interface ProductStoreSkeletonProps {
  NumberOfTimesTobeRendered: number;
}
const ProductStoreSkeleton: React.FC<ProductStoreSkeletonProps> = ({
  NumberOfTimesTobeRendered,
}) => {
  const ProductStoreListSkeletonTimesToBeLoaded = Array.from(
    { length: NumberOfTimesTobeRendered },
    (_, index) => index + 1
  );
  return (
    <>
      <div className="skeleton-product-store-count"></div>
      <div className="skeleton-list-container">
        {ProductStoreListSkeletonTimesToBeLoaded?.map((_) => {
          return (
            <div className="product-store-skeleton">
              <div className="skeleton-store"></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductStoreSkeleton;
