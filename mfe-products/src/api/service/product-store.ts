import axiosInstance from "../axios";

const productStoreBaseUrl =
  "https://devapi2.shop.com/store-search/v1/search?api_key=6f598d0a7639480eae2d266a1e87c15c";

export const fetchProductStores = async (
  query: string,
  size: number,
  page: number
): Promise<any> => {
  try {
    const res = await axiosInstance(productStoreBaseUrl).post("", {
      from: 0,
      //query,
      query: 'vitamins',
      size,
      siteType: "U",
      languageCode: "ENG",
      countryCode: "USA",
      page,
      weblevel: 0,
      aggregations: [
        "volumeType",
        "alphaSort",
        "categoryList",
        "storeTypeList",
        "region",
        "city",
        "catalogId",
        "storeAttributes",
      ],
      filters: {
        storeTypeList: "Partner Store",
      },
      fields: [
        "ibvOnly",
        "catalogLogo",
        "ibvStandard",
        "channelbitsDelim",
        "wwwLink",
        "name",
      ],
      userId: "1000432395",
      sort: "BEST_MATCH",
      productType: ["ONE", "CPA"],
      eCommerceEnabled: "1",
      
    });
    return res.data;
  } catch (err) {
    console.log("product store error", err);
    throw err;
  }
};
