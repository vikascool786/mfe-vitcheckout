import React, { useCallback } from "react";
import "./ProductPrice.scss";
import { PriceRange, ProductOption } from "../../utils/types/types";

interface ProductPriceProps {
  setPrice: Function;
  priceInfo: PriceRange;
  productOption: ProductOption[];
  permutation: string | number | object;
}

const ProductPrice: React.FC<ProductPriceProps> = ({
  setPrice,
  priceInfo,
  permutation,
  productOption,
}) => {
  const priceRange = (min?: string, max?: string) => {
    if (min && max && min == max) {
      return `${min}`;
    }
    if (min && max) {
      return `${min} - ${max}`;
    }

    return "N/A";
  };

  const productPrice = (
    originalPrice: string,
    salePrice: string,
    isSale: boolean
  ) => {
    if (isSale) {
      setPrice(salePrice);
      return (
        <>
          <span className="qa-sale-price product-price product-sale-price">
            {salePrice}
          </span>
          <span className="qa-price product-price product-price-strike-through">
            {originalPrice}
          </span>
        </>
      );
    } else {
      setPrice(originalPrice);
      return <span className="qa-price product-price">{originalPrice}</span>;
    }
  };

  const defaultPrice = () =>
    productPrice(
      priceRange(priceInfo.min, priceInfo.max),
      priceRange(priceInfo.minSale, priceInfo.maxSale),
      priceInfo.isOnSale
    );

  const getComputedPrice = useCallback(() => {
    if (priceInfo.min === "$0.00") return <></>;
    if (permutation && productOption) {
      const selectedPriceValue = productOption
        .find((pOpt) => pOpt.values.length > 1)
        ?.values.find((opt) => opt.textValue == permutation)
        ?.derived.retailPrice;
      const priceDetails = {
        originalPrice: selectedPriceValue?.max || "0",
        salePrice: selectedPriceValue?.maxSale || "0",
      };
      return productPrice(
        priceDetails.originalPrice,
        priceDetails.salePrice,
        priceInfo.isOnSale
      );
    } else {
      return defaultPrice();
    }
  }, [permutation]);

  return (
    <>
      {priceInfo.min === "$0.00" ? (
        <></>
      ) : (
        <div className="product-price-container">{getComputedPrice()}</div>
      )}
    </>
  );
};
export default ProductPrice;
