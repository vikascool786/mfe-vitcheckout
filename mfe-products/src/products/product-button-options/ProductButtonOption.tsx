import React, { useMemo } from "react";
import "./ProductButtonOption.scss";
import { ProductOption, AddToCartData } from "../../utils/types/types";
import { postAddToCart } from "../../api/service/product";
import { GET_API_ENDPOINT_BASE_URL } from "../../utils/helpers";

interface ProductButtonOptionProps {
  option: ProductOption[];
  productLinkUrl: string;
  selectedOption: string | number | object;
  permutations: any;
}

const ProductButtonOption: React.FC<ProductButtonOptionProps> = ({
  option,
  productLinkUrl,
  selectedOption,
  permutations,
}) => {
  const apiBaseUrl = GET_API_ENDPOINT_BASE_URL(true);
  const isSingleOptionandSingleValue =
    option && option.length === 1 && option[0]!.values.length === 1;

  const isSingleOptionMultiValueButSelected = useMemo(() => {
    return (
      option &&
      option.length === 1 &&
      option[0]!.values.length > 0 &&
      selectedOption
    );
  }, [selectedOption]);

  const isNoOptionProduct = !option;

  const showAddToCart =
    isSingleOptionandSingleValue ||
    isSingleOptionMultiValueButSelected ||
    isNoOptionProduct;

  const buildAtcData = () => {
    let atcSelectedOption;
    const { prodName, permutationData, prodId } = permutations;
    if (isSingleOptionandSingleValue) {
      atcSelectedOption = option[0]?.values[0]?.textValue;
    } else {
      atcSelectedOption = selectedOption;
    }
    const selectedPermutation = permutationData.find(
      (perm: any) => perm.permutationString === atcSelectedOption
    );

    const { permutationString, merchantSku } = selectedPermutation;
    const data: AddToCartData = {
      prodName,
      prodId,
      sku: merchantSku || "",
      option: permutationString || atcSelectedOption,
    };

    return data;
  };

  const onClickHandler = async () => {
    const selectedPermutation = buildAtcData();
    const cartData = await postAddToCart(selectedPermutation, apiBaseUrl);
    const sidecart: HTMLElement | null = document.querySelector(".js-side-cart");

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
        <button className="qa-atc button" onClick={onClickHandler}>
          + Add to Cart
        </button>
      ) : (
        <a className="qa-see-details button" href={productLinkUrl}>
          See Details
        </a>
      )}
    </div>
  );
};
export default ProductButtonOption;
