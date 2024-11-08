import React, { useState } from "react";
import "./Product.scss";
import Title from "../title/Title";
import Rating from "../ratings/Rating";
import ProductPrice from "../product-price/ProductPrice";
import ProductOptions from "../product-options/ProductOptions";
import { Product as TProduct } from "../../utils/types/types";
import ProductImage from "../product-image/ProductImage";
import ProductDerivedAttributes from "../product-derived-attributes/ProductDerivedAttributes";
import ProductMetaTag from "../product-meta-tag/ProductMetaTag";
import ProductButtonOption from "../product-button-options/ProductButtonOption";

interface ProductProps {
  prodPosition: number;
  productData: TProduct;
  baseUrl: string;
  partial?: boolean;
}
const Product: React.FC<ProductProps> = React.memo(
  ({ prodPosition, productData: pData, baseUrl, partial = false }) => {
    const [selectedPermutation, setSelectedPermutation] = useState<string>("");
    const [currentPrice, setCurrentPrice] = useState<string | number | object>(
      "$0.00"
    );
    const productLinkUrl = pData.derived?.productLinkUrl
      ? baseUrl + pData.derived.productLinkUrl
      : "";
    const alternateImageUrl: string = pData.derived.media?.[0]?.url || "";
    const { permutations, prodId } = pData;

    const atcData = {
      permutationData: permutations,
      prodName: pData.product.caption,
      prodId,
    };

    const updatePrice = (price: string) => setCurrentPrice(price);

    return (
      <div
        className={`qa-product-card product-container ${
          partial ? "partial" : "full"
        }`}
        data-position={prodPosition}
        data-prod-name={atcData.prodName}
        data-prod-price={currentPrice}
        data-prodid={prodId}
      >
        <div className="product">
          <ProductImage
            primaryImageUrl={pData.product.image.url}
            alternateImageUrl={alternateImageUrl}
            productOption={pData.options ? pData.options[0] : undefined}
            altText={pData.product.resizeImage.altText}
            selectedPermutation={selectedPermutation}
            productLinkUrl={productLinkUrl}
          />
          <div className="product-information">
            {pData.labels && pData.labels.length > 0 && (
              <ProductMetaTag label={pData!.labels[0]!} />
            )}
            <section className="product-data-container">
              <section className="product-header">
                <p className="qa-sold-by product-sold-by">
                  {/* {!pData.derived.isMAProduct && (
                    <>
                      <img
                        className="product-sold-by-icon"
                        src="https://img.shop.com/Image/resources/images/onecart-icon.svg"
                        alt="OneCart Store"
                      />
                      sold by{" "}
                    </>
                  )} */}
                  <img
                    className="product-sold-by-icon"
                    src="https://img.shop.com/Image/resources/images/onecart-icon.svg"
                    alt="OneCart Store"
                  />
                  sold by <span>{pData.storeName}</span>
                </p>
                <div className="product-title-container">
                  <Title
                    title={pData.product.caption}
                    productLinkUrl={productLinkUrl}
                  />
                </div>
              </section>
              <div className="product-review">
                <Rating
                  ratingInPercent={pData.derived.reviews.percentRating}
                  totalRating={pData.derived.reviews.total}
                />
              </div>
              <section>
                <ProductPrice
                  setPrice={updatePrice}
                  priceInfo={pData.derived.retailPrice}
                  permutation={selectedPermutation}
                  productOption={pData.options}
                />
                <ProductDerivedAttributes
                  rewards={pData.rewards}
                  coupon={pData.coupon}
                  freeShipping={pData.freeShipping}
                  uptoLabel={
                    pData.derived.retailPrice.min ===
                    pData.derived.retailPrice.max
                  }
                />
              </section>
              <ProductOptions
                productOptions={pData.options}
                permutationState={[selectedPermutation, setSelectedPermutation]}
                label={
                  (pData.options && pData.options[0]?.specInstrType) || "Option"
                }
              />
            </section>

            <ProductButtonOption
              title={pData.product.caption}
              option={pData.options}
              productLinkUrl={productLinkUrl}
              selectedOption={selectedPermutation}
              productId={pData.prodId}
              defaultPrice={pData.derived.retailPrice}
            />
          </div>
        </div>
      </div>
    );
  }
);
export default Product;
