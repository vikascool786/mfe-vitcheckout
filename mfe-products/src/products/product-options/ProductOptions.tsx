import React, { useMemo, useRef } from "react";
import "./ProductOptions.scss";
import { Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { ProductOption, StateArray } from "../../utils/types/types";
import ProductOptionPrompt from "./ProductOptionPrompt";
interface ProductOptionsProps {
  permutationState: StateArray<string | number | object>;
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

  const toDisplay = useMemo(() => {
    if (productOptions.length > 1 || productOptions[0]?.values.length === 1) {
      return false;
    }

    if (productOptions[0]?.specInstrType === "Size") {
      let toReturn = true;
      const options = productOptions[0].values;

      if (options && options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          if (
            !options[i]?.derived.swatchValue.text ||
            (options[i]!.derived.swatchValue.text &&
              options[i]!.derived.swatchValue.text.length > 3)
          ) {
            toReturn = false;
            break;
          }
        }
      } else {
        return false;
      }

      return toReturn;
    }
    if (productOptions[0]?.specInstrType === "Color") {
      let toReturn = true;
      const options = productOptions[0].values;
      for (let i = 0; i < options.length; i++) {
        if (options[i]! && !options[i]!.swatchResizeImage.plainUrl) {
          toReturn = false;
          break;
        }
      }
      return toReturn;
    }
    return false;
  }, []);

  // if (productOptions.length > 1 || productOptions[0]?.values.length === 1)
  //   return (
  //     <>
  //       <div className="prod-opt-ctn">
  //         {productOptions &&
  //           productOptions!
  //             .sort((a, b) => a.sortOrder - b.sortOrder)
  //             .map((opt) => (
  //               <div key={opt.specInstrType}>
  //                 <label>{opt.specInstrType}</label>{" "}
  //                 <select onChange={onOptionSelected(opt.sortOrder)}>
  //                   <option value={""}>Select</option>
  //                   {opt.values.map((val) => (
  //                     <option key={val.textValue} value={val.textValue}>
  //                       {val.textValue}
  //                     </option>
  //                   ))}
  //                 </select>
  //               </div>
  //             ))}
  //       </div>
  //     </>
  //   );

  if (!toDisplay) return <></>;

  const typeOfOptionLabel =
    productOptions[0]!.values?.find((opt) => opt.textValue === selectedKey)
      ?.textValue || "";

  return (
    <div>
      <div className="product-option-container">
        <div className="option-type">
          {!selectedKey && "Select "} {productOptions[0]?.specInstrType}:{" "}
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
            {productOptions[0]?.specInstrType === "Color"
              ? productOptions[0]?.values
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((opt) => (
                    <SwiperSlide
                      key={new Date().getTime() * Math.random()}
                      style={{ width: "auto" }}
                    >
                      <div
                        className={`qa-option option ${
                          selectedKey === opt.textValue ? "selected" : ""
                        } ${opt.derived.isOutOfStock ? "out-of-stock" : ""} `}
                        onClick={() => {
                          if (opt.derived.isOutOfStock) return;
                          setSelectedKey((prev) => {
                            if (prev === opt.textValue) return "";
                            return opt.textValue;
                          });
                        }}
                      >
                        <div className="option-background">
                          <img src={opt.swatchResizeImage.plainUrl} alt="" />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
              : productOptions[0]?.values
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((opt) => (
                    <SwiperSlide
                      key={new Date().getTime() * Math.random()}
                      style={{ width: "auto" }}
                    >
                      <div
                        className={`option ${
                          selectedKey === opt.textValue ? "selected" : ""
                        } ${opt.derived.isOutOfStock ? "out-of-stock" : ""}`}
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
                  ))}
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
