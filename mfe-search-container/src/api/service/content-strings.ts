import axiosInstance from "../axios";

const contentStringsPATH = "/content/v1/data";

const devApiKey = "0cf27ca394e94667ad6729d427b700d4";

export interface contentApiParams {
  api_key: string;
  collection: string;
  country: string;
  language: string;
}

export const fetchContentStrings = async (
  config: contentApiParams | object,
  baseUrl: string
): Promise<object> => {
  const apiEndpoint = baseUrl.replace("{{path}}", contentStringsPATH);
  const params = {
    ...config,
    api_key: devApiKey,
    collection: "global.search",
    country: "USA",
    language: "ENG",
  };
  const { response } = await axiosInstance(apiEndpoint)
    .get("", { params })
    .then((res) => {
      return res.data;
    });
  return response || {};
};
