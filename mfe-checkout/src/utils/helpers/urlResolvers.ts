import { APIMODE } from "../types/types";
export const GET_API_MODE = () =>
  (window.location.href
    .match(
      /(?<=https?:\/\/(?:www\.)?)(dev[a-z]{2,3}?|dev(-[a-z]{2,3})?|staging[a-z]{2,3}?|staging(-[a-z]{2,3})?|localhost)(?=\.|\:|\/)/
    )?.[0]
    .replace(/dev[a-z]{2,3}/, "dev")
    .replace(/staging[a-z]{2,3}/, "staging")
    .split("-")[0] || "prod") as APIMODE;

export const GET_API_ENDPOINT_BASE_URL = (mode: APIMODE) => {
  switch (mode) {
    case "localhost":
    case "dev":
      return "https://devapi2.shop.com{{path}}?api_key=6f598d0a7639480eae2d266a1e87c15c";
    case "staging":
      return "https://stagingapi2.shop.com{{path}}?api_key=759ef1fc9e4c4e8bbf900db5f4b7caba";
    case "prod":
    default:
      return "https://api2.shop.com{{path}}?api_key=93ccfc2eb6624b028341f00fed1db9a1";
  }
};
