const MfeResolver = (function () {
    const GET_API_MODE = () =>
      window.location.href
        .match(
          /(?<=https?:\/\/(?:www\.)?)(dev(-[a-z]{2,3})?|staging(-[a-z]{2,3})?|localhost)(?=\.|\:|\/)/
        )?.[0]
        .split("-")[0] || "prod";
  
    const apiMode = GET_API_MODE();
  
    const GET_MFE_HOST = (isStore = false, mfeSlug = "", isLocal) => {
      if (isLocal) {
        return isStore ? "http://localhost:3000" : "http://localhost:3009";
      }
      switch (apiMode) {
        case "dev":
          return `https://d29q5zo2af0lw0.cloudfront.net/${
            isStore ? "Store" : mfeSlug
          }`;
        case "staging":
          return `https://d1pba8i1pdjgdk.cloudfront.net/${
            isStore ? "Store" : mfeSlug
          }`;
        case "prod":
        default:
          return `https://d2qcfi6co0kj0v.cloudfront.net/${
            isStore ? "Store" : mfeSlug
          }`;
      }
    };
  
    const getEndpoints = (isLocal = false) => {
      return {
        store: GET_MFE_HOST(true, "", isLocal),
        searchContainer: GET_MFE_HOST(false, "SearchContainer", isLocal),
      };
    };
  
    return {
      getEndpoints: getEndpoints,
    };
  })();
  
  module.exports = MfeResolver;