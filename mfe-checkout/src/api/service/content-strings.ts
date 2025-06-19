import axiosInstance from "../axios";

const contentStringsPATH = "/content/v1/data";

export interface contentApiParams {
  collection?: string;
  country: string;
  language: string;
}

export const fetchContentStrings = async (
  config: contentApiParams = { country: "USA", language: "ENG" },
  baseUrl: string
): Promise<object> => {
  const apiEndpoint = baseUrl.replace("{{path}}", contentStringsPATH);
  const params = {
    ...config,
    collection: "singlePageCheckout",
  };
  const { response } = await axiosInstance(apiEndpoint)
    .get("", { params })
    .then((res) => {
      return res.data;
    });
  return response || {};
};
