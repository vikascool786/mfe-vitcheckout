import { APIMODE } from "./types/types";

export const GET_API_MODE = () =>
  (window.location.href
    .match(
      /(?<=https?:\/\/(?:www\.)?)(dev(-[a-z]+)?|staging(-[a-z]+)?|localhost)(?=\.|\:|\/)/
    )?.[0]
    .split("-")[0] || "prod") as APIMODE;

export const GET_API_ENDPOINT_BASE_URL = (
  mode: APIMODE,
  isModuleRanker = false,
  isTranslationService = false
) => {
  if (isTranslationService) {
    switch (mode) {
      case "localhost":
      // return `https://stagingapi2.shop.com{{path}}?api_key=759ef1fc9e4c4e8bbf900db5f4b7caba`;
      case "dev":
        return `https://devapi2.shop.com{{path}}?api_key=6f598d0a7639480eae2d266a1e87c15c`;
      case "staging":
        return `https://stagingapi2.shop.com{{path}}?api_key=759ef1fc9e4c4e8bbf900db5f4b7caba`;
      case "prod":
      default:
        return `https://api2.shop.com{{path}}?api_key=93ccfc2eb6624b028341f00fed1db9a1`;
    }
  }
  switch (mode) {
    case "localhost":
    // return `https://stagingapi2.shop.com{{path}}?api_key=${
    //   isModuleRanker
    //     ? "78cfbfddd65949e886faef65db6bba26"
    //     : "759ef1fc9e4c4e8bbf900db5f4b7caba"
    // }`;
    case "dev":
      return `https://devapi2.shop.com{{path}}?api_key=${isModuleRanker
          ? "010308abff314fcbad7452230f0a918d"
          : "6f598d0a7639480eae2d266a1e87c15c"
        }`;
    case "staging":
      return `https://stagingapi2.shop.com{{path}}?api_key=${isModuleRanker
          ? "78cfbfddd65949e886faef65db6bba26"
          : "759ef1fc9e4c4e8bbf900db5f4b7caba"
        }`;
    case "prod":
    default:
      return `https://api2.shop.com{{path}}?api_key=${isModuleRanker
          ? "a1f1ee59f2074026bcca990180af26d7"
          : "93ccfc2eb6624b028341f00fed1db9a1"
        }`;
  }
};

export const GET_API_ENDPOINT_BASE_URL_ONLY = () => {
  const mode = GET_API_MODE();
  switch (mode) {
    case "localhost":
    // return "https://stagingapi2.shop.com";
    case "dev":
      return "https://devapi2.shop.com";
    case "staging":
      return "https://stagingapi2.shop.com";
    case "prod":
    default:
      return "https://api2.shop.com";
  }
};

export const GET_PAYPAL_RETURN_URL = () => {
  const mode = GET_API_MODE();
  switch (mode) {
    case "localhost":
      return "http://localhost:3011/nbts/checkout/v2";
    case "dev":
      return "https://dev.shop.com/nbts/checkout/v2";
    case "staging":
      return "https://staging.shop.com/nbts/checkout/v2";
    case "prod":
    default:
      return "https://shop.com/nbts/checkout/v2";
  }
};

export const GET_PAYPAL_CLIENT_ID = () => {
  switch (GET_API_MODE()) {
    case "localhost":
    // return "ARxYpxURBvfOG4_8UoCf8686KdIHB_1Vg6L_9E_oK8PycqgRHQnwpx46MS3Ej7dzZiv9r0Kui72LeEVw";
    case "dev":
      return "AdKcUB21vu4saO5O4Hcyzw0gytZyJ-R0Nq16Uci9W4NAYKRCPD_ITB7ppw5xZkOOCg4JKjIB-Uwn0Eqc";
    case "staging":
      return "ARxYpxURBvfOG4_8UoCf8686KdIHB_1Vg6L_9E_oK8PycqgRHQnwpx46MS3Ej7dzZiv9r0Kui72LeEVw";
    case "prod":
      return "Abo_jiuNTioAiXEbJJKFn4iUqiFDxGLO9_Sv5M_6ljwWFfgAnQt5kBb1fmUB1AqdT1Uv1E4wuAlxi9-6";
    default:
      return "AdKcUB21vu4saO5O4Hcyzw0gytZyJ-R0Nq16Uci9W4NAYKRCPD_ITB7ppw5xZkOOCg4JKjIB-Uwn0Eqc";
  }
};

export const GET_APM_URL = () => {
  switch (GET_API_MODE()) {
    case "localhost":
      return "https://04fc5a1627284696b6261f80056b2188.apm.us-east-2.aws.elastic-cloud.com:443";
    case "dev":
    case "staging":
      return "https://04fc5a1627284696b6261f80056b2188.apm.us-east-2.aws.elastic-cloud.com:443";
    case "prod":
    default:
      return "https://prd-apm-east-1.apm.us-east-1.aws.found.io";
  }
};

export const GET_API_KEY = () => {
  switch (GET_API_MODE()) {
    case "localhost":
    // return "759ef1fc9e4c4e8bbf900db5f4b7caba";
    case "dev":
      return "6f598d0a7639480eae2d266a1e87c15c";
    case "staging":
      return "759ef1fc9e4c4e8bbf900db5f4b7caba";
    case "prod":
      return "93ccfc2eb6624b028341f00fed1db9a1";
    default:
      return "";
  }
};

export const GET_TOKEN_SERVICE = () => {
  switch (GET_API_MODE()) {
    case "localhost":
      return "https://devccsoa.marketamerica.com/TokenService/GetToken";
    case "dev":
      return "https://devccsoa.marketamerica.com/TokenService/GetToken";
    case "staging":
      return "https://stagingccsoa.marketamerica.com/TokenService/GetToken";
    case "prod":
      return "https://ccsoa.marketamerica.com/TokenService/GetToken";
    default:
      return "";
  }
};

export const GET_C2P_LIB = () => {
  switch (GET_API_MODE()) {
    case "localhost":
    case "dev":
    case "staging":
      return "https://sandbox.src.mastercard.com/srci/integration/2/lib.js";
    case "prod":
    default:
      return "https://src.mastercard.com/srci/integration/2/lib.js";
  }
};

export const GET_C2P_DPAID = () => {
  switch (GET_API_MODE()) {
    case "localhost":
    case "dev":
    case "staging":
      return "3a4f6132-0259-4609-b078-5e5ad3fa3f4f";
    case "prod":
    default:
      return "493af363-de55-4eb5-9141-7ee7c35b50cd";
  }
};

export const GET_SHOP_CART_URL = () => {
  switch (GET_API_MODE()) {
    case "localhost":
      return "https://dev.shop.com/nbts/ccn_cart.xhtml";
    case "dev":
      return "https://dev.shop.com/nbts/ccn_cart.xhtml";
    case "staging":
      return "https://staging.shop.com/nbts/ccn_cart.xhtml";
    case "prod":
      return "https://www.shop.com/nbts/ccn_cart.xhtml";
    default:
      return "https://dev.shop.com/nbts/ccn_cart.xhtml";
  }
};

export const GET_TOKEN_SERVICE_SHOP = () => {
  switch (GET_API_MODE()) {
    case "localhost":
      return "https://dev.shop.com/TokenService/GetToken";
    case "dev":
      return "https://dev.shop.com/TokenService/GetToken";
    case "staging":
      return "https://staging.shop.com/TokenService/GetToken";
    case "prod":
      return "https://www.shop.com/TokenService/GetToken";
    default:
      return "";
  }
};

export const GET_AJAX_ENDPOINT_BASE_URL = () => {
  const mode = GET_API_MODE();
  switch (mode) {
    case "localhost":
      return "https://localhostapi.shop.com{{path}}";
    case "dev":
    case "staging":
    case "prod":
    default:
      return `${GET_BASE_URL}{{path}}`;
  }
};

export const GET_BASE_URL =
  window.location.href.match(
    /^(https:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]+)+)/
  )?.[0] || "https://shop.com";
