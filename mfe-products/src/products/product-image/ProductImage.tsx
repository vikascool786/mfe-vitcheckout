import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProductImage.scss";
import { ProductOption } from "../../utils/types/types";

interface ProductImageProps {
  primaryImageUrl: string;
  alternateImageUrl: string;
  productOption: ProductOption | undefined;
  altText: string;
  selectedPermutation: string | number | object;
  productLinkUrl?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  primaryImageUrl,
  alternateImageUrl,
  productOption,
  altText,
  selectedPermutation,
  productLinkUrl = "",
}) => {
  const [showAlternateImage, setShowAlternateImage] = useState<boolean>(true);

  useEffect(() => {
    const showImage =
      alternateImageUrl && (productOption ? !!!selectedPermutation : true);
    setShowAlternateImage(!!showImage);
  }, [selectedPermutation, productOption]);

  const ImageComponent = (url: string) => (
    <img className="qa-product-image product-image" src={url} alt={altText} />
  );

  const PrimaryImageComponent = useMemo(() => {
    if (!selectedPermutation || !productOption) {
      return () => ImageComponent(primaryImageUrl);
    }
    const selectedOptionImage: string | undefined = productOption.values.find(
      (val) => {
        return val.textValue == selectedPermutation;
      }
    )?.image;

    return () =>
      selectedOptionImage
        ? ImageComponent(selectedOptionImage)
        : ImageComponent(primaryImageUrl);
  }, [selectedPermutation]);

  const AlternateImageComponent = () => (
    <img className="product-image-on-hover" src={alternateImageUrl} alt="" />
  );
  return (
    <div className="product-image-container">
      <a href={productLinkUrl}>
        <div className="non-mobile-images">
          <PrimaryImageComponent />
          {showAlternateImage && <AlternateImageComponent />}
        </div>
        <div className="mobile-images">
          <Swiper
            spaceBetween={5}
            slidesPerView={"auto"}
            pagination={{ clickable: true }}
            navigation={false}
            modules={[Navigation, Pagination]}
            className="product-swiper"
          >
            <SwiperSlide>
              <PrimaryImageComponent />
            </SwiperSlide>
            {showAlternateImage && (
              <SwiperSlide>
                <AlternateImageComponent />
              </SwiperSlide>
            )}
          </Swiper>
        </div>
      </a>
    </div>
  );
};
export default ProductImage;
