import React, { useMemo } from "react";
import "./ProductButtonOption.scss";
import {
  ProductOption,
  AddToCartData,
  PriceRange,
} from "../../utils/types/types";
import { postAddToCart } from "../../api/service/product";
import { GET_AJAX_ENDPOINT_BASE_URL } from "../../utils/helpers";

interface ProductButtonOptionProps {
  option: ProductOption[];
  productLinkUrl: string;
  selectedOption: string;
  title: string;
  productId: string;
  defaultPrice: PriceRange;
}

const ProductButtonOption: React.FC<ProductButtonOptionProps> = ({
  option,
  productLinkUrl,
  selectedOption,
  title,
  productId,
  defaultPrice,
}) => {
  const ajaxBaseUrl = GET_AJAX_ENDPOINT_BASE_URL();
  const isSingleOptionandSingleValue =
    option && option.length === 1 && option[0]!.values.length === 1;

  const isMultiSizeSingleColorSelected = useMemo(() => {
    const sizeOptions =
      option && option.find((opt) => opt.specInstrType === "Size");
    const colorOptions =
      option && option.find((opt) => opt.specInstrType === "Color");
    return (
      sizeOptions?.values &&
      sizeOptions.values.length > 1 &&
      colorOptions?.values &&
      colorOptions.values.length === 1 &&
      selectedOption
    );
  }, [selectedOption]);

  const isSingleOptionMultiValueButSelected = useMemo(() => {
    return (
      option &&
      option.length === 1 &&
      option[0]!.values.length > 0 &&
      selectedOption
    );
  }, [selectedOption]);

  const isNoOptionProduct = !option;

  const isPriceNotZero = useMemo(() => {
    if (isSingleOptionMultiValueButSelected) {
      const selected = option[0]?.values.find(
        (opt) => opt.textValue == selectedOption
      );
      return selected?.derived.retailPrice.min != "$0.00";
    }
    return defaultPrice.min != "$0.00";
  }, [selectedOption]);

  const showAddToCart =
    (isSingleOptionandSingleValue ||
      isSingleOptionMultiValueButSelected ||
      isMultiSizeSingleColorSelected ||
      isNoOptionProduct) &&
    isPriceNotZero;

  const buildAtcData = () => {
    let atcSelectedOption = "";
    if (isSingleOptionandSingleValue) {
      atcSelectedOption = option[0]?.values[0]?.textValue!;
    } else {
      atcSelectedOption = selectedOption;
    }
    const data: AddToCartData = {
      description: title,
      prodId: productId,
      option: atcSelectedOption,
    };

    return data;
  };

  const onClickHandler = async () => {
    const selectedPermutation = buildAtcData();
    const cartData = await postAddToCart(selectedPermutation, ajaxBaseUrl);
    const sidecart: HTMLElement | null =
      document.querySelector(".js-side-cart");

    if (cartData) {
      if (!cartData.errorMessage && sidecart) {
        sidecart.style.display = "block";
      }
      document.dispatchEvent(
        new CustomEvent("updateSidecart", {
          detail: {
            cart: cartData ?? {},
            errorMessage: cartData.errorMessage,
          },
        })
      );
    }
  };

  return (
    <div className="product-action-button-container">
      {showAddToCart ? (
        <button className="qa-atc mfe-button" onClick={onClickHandler}>
          + Add to Cart
        </button>
      ) : (
        <a className="qa-see-details mfe-button" href={productLinkUrl}>
          See Details
        </a>
      )}
    </div>
  );
};
export default ProductButtonOption;
