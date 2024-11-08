import axiosInstance from "../axios";
import { AddToCartData } from "../../utils/types/types";

const productBaseUrl =
  "https://devapi2.shop.com/product-search/v1/search?api_key=6f598d0a7639480eae2d266a1e87c15c";

export const fetchProducts = async (
  query: string,
  size: number,
  page: number
): Promise<any> => {
  try {
    const res = await axiosInstance(productBaseUrl).post("", {
      from: 0,
      //query,
      query: "vitamins",
      size,
      siteType: "SHP",
      languageCode: "ENG",
      countryCode: "USA",
      page,
      weblevel: 0,
      aggregations: ["level2Category", "brand"],
      // filters: {
      //   level1Category: "32841",
      // },
      fields: [
        "prodId",
        "product",
        "personalizedAttributes",
        "options",
        "permutations",
        "supplemental",
        "derivedAttributes",
        "customerAttributes",
        "storeName",
      ],
      userId: "1000432395",
      sort: "BEST_MATCH",
    });
    return res.data;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

const FAMOS_ATC_URL_PATH = "/ajaxaction/add-to-cart/multi-add";

export const postAddToCart = async (
  atcData: AddToCartData,
  baseUrl: string
): Promise<any> => {
  const apiEnpointUrl = baseUrl.replace("{{path}}", FAMOS_ATC_URL_PATH);
  const productsDataArray = {
    prodId: [] as Array<string>,
    options: [] as Array<string>,
    quantity: [] as Array<number>,
    description: [] as Array<string>,
    isCustomCocktail: [] as Array<boolean>,
  };
  const { option, prodId, description } = atcData;

  productsDataArray.prodId.push(prodId);
  productsDataArray.options.push(option === null || !option ? "" : option);
  productsDataArray.quantity.push(1);
  productsDataArray.description.push(description || "");
  productsDataArray.isCustomCocktail.push(false);

  return await axiosInstance(apiEnpointUrl)
    .post("", productsDataArray)
    .then((r) => {
      const { data } = r;
      if (data.shoppingCartData && !data.errorMessage) return data;
      throw new Error("Error adding products");
    })
    .catch((err) => console.log(err));
};
