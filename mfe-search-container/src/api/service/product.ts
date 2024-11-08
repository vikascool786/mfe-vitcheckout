import { filters, searchAppConfig } from "../../utils/types/types";
import axiosInstance from "../axios";

const productPath = "/product-search/v1/search";

export const fetchProducts = async (
  baseUrl: string,
  query: string,
  size: number,
  page: number,
  appConfigValue: searchAppConfig,
  filtersApplied?: filters,
  sort?: string,
  spellCheck?: boolean
): Promise<any> => {
  const apiEndpoint = baseUrl.replace("{{path}}", productPath);
  try {
    const res = await axiosInstance(apiEndpoint).post("", {
      from: 0,
      query,
      size,
      siteType: appConfigValue.siteType,
      languageCode: appConfigValue.languageCode,
      countryCode: appConfigValue.countryCode,
      page,
      weblevel: 0,
      aggregations: [
        "node.category.level1.id",
        "node.category.level2.id",
        "node.brand.id",
        "node.attribute.id",
        "node.id",
        "shippingOffers",
        "saleItems",
        "fsahsa",
        "exclusiveBrands",
        "stores",
        "price",
      ],
      filters: filtersApplied ? filtersApplied : {},
      fields: [
        "product.image",
        "product.resizeImage",
        "options.prompt",
        "options.specInstrType",
        "options.values.sortOrder",
        "options.values.derived",
        "options.values.swatchResizeImage",

        "options.values.textValue", //remove
        "options.values.image", //remove
        "derived",
        "permutations.merchantSku",
        "rewards",
        "coupon",
        "labels",
        "freeShipping",
        "storeName",
        "supplemental.goldenRecord.opContainerId",
      ],
      ...(appConfigValue.portalId && {
        portalId: appConfigValue.portalId,
      }),
      ...(appConfigValue.pcId && { pcId: parseInt(appConfigValue.pcId) }),
      sort: sort ? sort : "best-match",
      skipCategoryClassifier: false,
      ...(spellCheck && { skipSpellCheck: true }),
    });
    return res.data;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};
