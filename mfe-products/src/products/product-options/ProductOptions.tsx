import React, { useMemo, useRef } from "react";
import "./ProductOptions.scss";
import { Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import {
  ProductOption,
  ProductOptionValue,
  StateArray,
} from "../../utils/types/types";
import ProductOptionPrompt from "./ProductOptionPrompt";
interface ProductOptionsProps {
  permutationState: StateArray<string>;
  productOptions?: ProductOption[];
  label: string;
}

interface SelectedProductOption {
  sortOrder: number;
  text: string;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  permutationState,
  productOptions = [],
}) => {
  const [selectedKey, setSelectedKey] = permutationState;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const isOptionValueValid = (
    options: ProductOptionValue[],
    type: "Size" | "Color"
  ) => {
    let toReturn = true;
    if (type === "Size") {
      for (let i = 0; i < options.length; i++) {
        if (
          !options[i]?.derived.swatchValue.text ||
          (options[i]!.derived.swatchValue.text &&
            options[i]!.derived.swatchValue.text.length > 5)
        ) {
          toReturn = false;
          break;
        }
      }
    } else if (type === "Color") {
      for (let i = 0; i < options.length; i++) {
        if (
          options[i]! &&
          !(
            options[i]!.derived.swatchValue.media.image ||
            options[i]!.derived.swatchValue.colorCode
          )
        ) {
          toReturn = false;
          break;
        }
      }
    } else {
      toReturn = false;
    }
    return toReturn;
  };

  const toDisplay = useMemo(() => {
    if (productOptions.length === 0) {
      return false;
    }
    if (productOptions.length > 1) {
      const sizeOptions = productOptions.find(
        (opt) => opt.specInstrType === "Size"
      );
      const colorOptions = productOptions.find(
        (opt) => opt.specInstrType === "Color"
      );
      // if the options case in any other than : multi options with Multi size and single color , we dont show it
      // check for value for this special case
      if (
        sizeOptions?.values &&
        sizeOptions.values.length > 1 &&
        colorOptions?.values &&
        colorOptions.values.length === 1
      ) {
        // check if size option is valid / we dont check for color because we dont show it
        return isOptionValueValid(sizeOptions.values, "Size");
      } else {
        return false;
      }
    }

    if (productOptions.length === 1 && productOptions[0]?.values.length === 1) {
      return false;
    }
    let toReturn = true;

    for (let i = 0; i < productOptions.length; i++) {
      const productOptionType = productOptions[i]?.specInstrType!;
      const options = productOptions[i]?.values || [];
      if (options && options.length > 0) {
        toReturn = isOptionValueValid(options, productOptionType);
      } else {
        toReturn = false;
      }
    }

    return toReturn;
  }, []);

  const typeOfOptionLabel = useMemo(() => {
    if (selectedKey) {
      return (
        productOptions
          .find((opt) => opt.values.length > 1)
          ?.values.find((p) => p.textValue === selectedKey)?.textValue || ""
      );
    }
    return "";
  }, [selectedKey]);

  if (!toDisplay) return <></>;

  return (
    <div>
      <div className="product-option-container">
        <div className="option-type">
          <div className="option-prompt-label">
            {!selectedKey && "Select "}{" "}
            {productOptions.find((opt) => opt.values.length > 1)?.prompt}{" "}
          </div>

          {selectedKey && <ProductOptionPrompt prompt={typeOfOptionLabel} />}
        </div>
        <div className="options-container">
          <span className="nav-button-prev" ref={prevRef}>
            <i className="arrow left-arrow"></i>
          </span>
          <Swiper
            spaceBetween={5}
            slidesPerView={"auto"}
            navigation
            onInit={(swiper) => {
              setTimeout(() => {
                if (
                  prevRef.current &&
                  nextRef.current &&
                  swiper.params.navigation
                ) {
                  //@ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  //@ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }
              });
            }}
            modules={[Navigation, Scrollbar]}
          >
            {productOptions.map((pOpt) => {
              if (pOpt.values.length > 1) {
                return pOpt.specInstrType === "Color"
                  ? pOpt.values
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((opt) => (
                        <SwiperSlide
                          key={new Date().getTime() * Math.random()}
                          style={{ width: "auto" }}
                        >
                          <div
                            className={`qa-option option ${
                              selectedKey === opt.textValue ? "selected" : ""
                            } ${
                              opt.derived.isOutOfStock ? "out-of-stock" : ""
                            } `}
                            onClick={() => {
                              if (opt.derived.isOutOfStock) return;
                              setSelectedKey((prev) => {
                                if (prev === opt.textValue) return "";
                                return opt.textValue;
                              });
                            }}
                          >
                            <div
                              className="option-background"
                              style={
                                opt.derived.swatchValue.media.image
                                  ? {}
                                  : {
                                      background:
                                        opt.derived.swatchValue.colorCode ||
                                        "#f0f1f7",
                                    }
                              }
                            >
                              <img
                                src={opt.derived.swatchValue.media.image}
                                alt=""
                              />
                            </div>
                          </div>
                        </SwiperSlide>
                      ))
                  : pOpt.values
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((opt) => (
                        <SwiperSlide
                          key={new Date().getTime() * Math.random()}
                          style={{ width: "auto" }}
                        >
                          <div
                            className={`option ${
                              selectedKey === opt.textValue ? "selected" : ""
                            } ${
                              opt.derived.isOutOfStock ? "out-of-stock" : ""
                            }`}
                            onClick={() => {
                              if (opt.derived.isOutOfStock) return;
                              setSelectedKey((prev) => {
                                if (prev === opt.textValue) return "";
                                return opt.textValue;
                              });
                            }}
                          >
                            <div className="option-label">
                              {opt.derived.swatchValue.text?.toUpperCase()}
                            </div>
                            <div className="option-background"></div>
                          </div>
                        </SwiperSlide>
                      ));
              }
              return <></>;
            })}
          </Swiper>
          <span className="nav-button-next" ref={nextRef}>
            <i className="arrow right-arrow"></i>
          </span>
        </div>
      </div>
    </div>
  );
};
export default ProductOptions;
