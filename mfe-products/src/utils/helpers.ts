import { APIMODE } from "./types/types";

export const GET_BASE_URL =
  window.location.href.match(
    /^(https:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]+)+)/
  )?.[0] || "https://shop.com";

export const GET_API_MODE = () =>
  (window.location.href
    .match(
      /(?<=https?:\/\/(?:www\.)?)(dev(-[a-z]{2,3})?|staging(-[a-z]{2,3})?|localhost)(?=\.|\:|\/)/
    )?.[0]
    .split("-")[0] || "prod") as APIMODE;

export const GET_API_ENDPOINT_BASE_URL = (isATC = false) => {
  if (isATC) {
    const domain = window.location.hostname;
    return `https://${domain}{{path}}`;
  }
  const mode = GET_API_MODE();
  switch (mode) {
    case "localhost":
      return "https://localhostapi.shop.com{{path}}";
    case "dev":
      return "https://devapi2.shop.com{{path}}";
    case "staging":
      return "https://stagingapi2.shop.com{{path}}";
    case "prod":
    default:
      return "https://api.shop.com{{path}}";
  }
};
