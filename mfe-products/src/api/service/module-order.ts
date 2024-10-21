import { ModuleRanker } from "../../utils/types/types";
import axiosInstance from "../axios";

const getModuleOrderBaseUrl = (keyword: string): string =>
  `https://api2.shop.com/page-template/v1/search-landing-page/module-ranker/vitamins?site_type=SHP&channelBit=62&api_key=93ccfc2eb6624b028341f00fed1db9a1`;
//`https://devapi2.shop.com/page-template/v1/search-landing-page/module-ranker/${keyword}?siteType=SHP&channelBit=62&api_key=6f598d0a7639480eae2d266a1e87c15c`;

export const fetchModuleOrder = async (keyword: string): Promise<any> => {
  try {
    const res = await axiosInstance(getModuleOrderBaseUrl(keyword)).get("", {
      headers: {
        'Authorization': '6f598d0a7639480eae2d266a1e87c15c'
      }
    });
    return res;
  } catch (err) {
    console.log("module error", err);
    throw err;
  }
};
