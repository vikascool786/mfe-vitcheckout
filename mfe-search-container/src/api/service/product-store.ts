import { searchAppConfig } from "../../utils/types/types";
import axiosInstance from "../axios";

const productStorePath = "/store-search/v1/search";

export const fetchProductStores = async (
  baseUrl: string,
  query: string,
  size: number,
  page: number,
  appConfigValue: searchAppConfig
): Promise<any> => {
  const apiEndpoint = baseUrl.replace("{{path}}", productStorePath);
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
      fields: [
        "ibvOnly",
        "catalogLogo",
        "ibvStandard",
        "channelbitsDelim",
        "wwwLink",
        "name",
        "derived",
        "labels",
        "rewards",
      ],
      ...(appConfigValue.pcId && { pcId: parseInt(appConfigValue.pcId) }),
      sort: "BEST_MATCH",
      productType: ["ONE", "CPA", "MA"],
      eCommerceEnabled: "1",
    });
    return res.data;
  } catch (err) {
    console.log("product store error", err);
    throw err;
  }
};
