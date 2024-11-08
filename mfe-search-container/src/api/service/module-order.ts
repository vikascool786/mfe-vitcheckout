import axiosInstance from "../axios";

const moduleOrderPath = `/page-template/v3/search-landing-page/module-ranker`;

export const fetchModuleOrder = async (
  keyword: string,
  baseUrl: string
): Promise<any> => {
  const apiEndpoint = baseUrl.replace("{{path}}", moduleOrderPath);
  try {
    const res = await axiosInstance(apiEndpoint).post("", {
      query: keyword,
      siteType: "SHP",
      languageCode: "ENG",
      countryCode: "USA",
      weblevel: 2,
    });
    return res;
  } catch (err) {
    console.log("module error", err);
    throw err;
  }
};
