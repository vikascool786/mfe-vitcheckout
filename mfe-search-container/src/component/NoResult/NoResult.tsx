import React from "react";
import "./NoResult.scss";
import { ModuleOrder, Module } from "../../utils/types/types";
import ErrorPage from "../ErrorPage/ErrorPage";

interface NoResultProps {
  keyword: string;
  moduleOrder: Module[];
  products: any;
  productStores: any;
}

const NoResultUI: React.FC<{
  keyword: string;
  message: string;
}> = ({ keyword, message }) => (
  <div className="no-result-container">
    <div className="no-result-icon">
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask
          id="mask0_817_961"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="72"
          height="72"
        >
          <rect
            x="0.609375"
            y="0.396484"
            width="71.2913"
            height="71.2913"
            fill="#D9D9D9"
          />
        </mask>
        <g mask="url(#mask0_817_961)">
          <path
            d="M33.2881 53.865C39.031 53.865 43.9322 51.8429 47.9919 47.7986C52.0515 43.7543 54.0813 38.8453 54.0813 33.0717C54.0813 27.3288 52.0515 22.4276 47.9919 18.3679C43.9322 14.3083 39.031 12.2785 33.2881 12.2785C27.5144 12.2785 22.6055 14.3083 18.5612 18.3679C14.5169 22.4276 12.4948 27.3288 12.4948 33.0717C12.4948 38.8453 14.5169 43.7543 18.5612 47.7986C22.6055 51.8429 27.5144 53.865 33.2881 53.865ZM33.2881 44.4969C29.2933 44.4969 25.7468 43.4476 22.6486 41.349C19.5504 39.2508 17.3178 36.4917 15.9509 33.0717C17.3178 29.7013 19.5504 26.9546 22.6486 24.8317C25.7468 22.7083 29.2933 21.6466 33.2881 21.6466C37.2333 21.6466 40.7551 22.7083 43.8533 24.8317C46.9515 26.9546 49.1994 29.7013 50.597 33.0717C49.1994 36.4917 46.9515 39.2508 43.8533 41.349C40.7551 43.4476 37.2333 44.4969 33.2881 44.4969ZM33.2881 40.9546C36.106 40.9546 38.7015 40.2558 41.0744 38.8582C43.4468 37.4606 45.3147 35.5318 46.6782 33.0717C45.3147 30.6419 43.4468 28.7205 41.0744 27.3075C38.7015 25.8951 36.106 25.1889 33.2881 25.1889C30.4394 25.1889 27.8241 25.8951 25.4423 27.3075C23.06 28.7205 21.1871 30.6419 19.8237 33.0717C21.1871 35.5318 23.06 37.4606 25.4423 38.8582C27.8241 40.2558 30.4394 40.9546 33.2881 40.9546ZM33.2881 37.5274C34.5257 37.5274 35.5778 37.1019 36.4442 36.2509C37.3106 35.3998 37.7438 34.3401 37.7438 33.0717C37.7438 31.834 37.3106 30.782 36.4442 29.9156C35.5778 29.0492 34.5257 28.616 33.2881 28.616C32.0197 28.616 30.9599 29.0492 30.1089 29.9156C29.2579 30.782 28.8323 31.834 28.8323 33.0717C28.8323 34.3401 29.2579 35.3998 30.1089 36.2509C30.9599 37.1019 32.0197 37.5274 33.2881 37.5274ZM33.2881 58.3207C29.7844 58.3207 26.5018 57.6581 23.4402 56.3327C20.3781 55.0074 17.7084 53.2061 15.4311 50.9287C13.1537 48.6514 11.3524 45.9816 10.027 42.9196C8.70172 39.858 8.03906 36.5754 8.03906 33.0717C8.03906 29.5988 8.70172 26.3313 10.027 23.2692C11.3524 20.2071 13.1537 17.53 15.4311 15.2378C17.7084 12.9451 20.3781 11.1361 23.4402 9.81074C26.5018 8.48542 29.7844 7.82275 33.2881 7.82275C36.761 7.82275 40.0285 8.48542 43.0906 9.81074C46.1527 11.1361 48.8298 12.9451 51.122 15.2378C53.4147 17.53 55.2237 20.2071 56.5491 23.2692C57.8744 26.3313 58.537 29.5988 58.537 33.0717C58.537 36.164 58.0125 39.083 56.9634 41.8287C55.9139 44.5744 54.4638 47.0631 52.6132 49.295L64.478 61.1598L61.33 64.2617L49.466 52.4422C47.2342 54.2933 44.7454 55.7357 41.9997 56.7694C39.254 57.8036 36.3501 58.3207 33.2881 58.3207Z"
            fill="#1C1B1F"
          />
        </g>
      </svg>
    </div>
    <div className="no-result-title">
      <span>0 Results</span> for "{keyword}"
    </div>
    <div className="no-result-message">{message}</div>
  </div>
);
const NoResult: React.FC<NoResultProps> = ({
  keyword,
  products,
  productStores,
  moduleOrder,
}) => {
  const isRelatedSearch =
    products?.messages?.relatedSearchApplied?.isZeroResultOnOriginalSearch;
  const isProdEmpty = products?.hits?.length === 0;
  const isStoresEmpty = productStores?.hits?.length === 0;
  const isProductInModuleRanker = moduleOrder?.indexOf("products") !== -1;
  const isStoreInModuleRanker = moduleOrder?.indexOf("stores") !== -1;

  const showNoResult =
    (isProductInModuleRanker && isProdEmpty) ||
    (isStoreInModuleRanker && isStoresEmpty && isProdEmpty);

  const noResultMessage = () => {
    const concateMessage =
      (isProdEmpty || isRelatedSearch) && isStoresEmpty
        ? "store or product"
        : isProdEmpty || isRelatedSearch
        ? "product"
        : isStoresEmpty
        ? "store"
        : "";
    return `Sorry. We could not find any ${concateMessage} matches.`;
  };

  const noResultView = () => {
    if (isProdEmpty && isStoresEmpty) {
      return (
        <div className="error-page-container">
          <NoResultUI keyword={keyword} message={noResultMessage()} />
          <ErrorPage isFromNoResult={true} />
        </div>
      );
    }
    if (isProductInModuleRanker && isRelatedSearch) {
      return (
        <div className="error-page-container">
          <NoResultUI keyword={keyword} message={noResultMessage()} />
        </div>
      );
    }
    if (showNoResult) {
      return (
        <div className="error-page-container">
          <NoResultUI keyword={keyword} message={noResultMessage()} />;
        </div>
      );
    }
    return <></>;
  };

  return <>{noResultView()}</>;
};
export default NoResult;
