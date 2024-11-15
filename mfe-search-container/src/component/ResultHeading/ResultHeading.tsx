import React, { useEffect } from "react";
import "./ResultHeading.scss";
import { ListingCategoryEnum } from "../../utils/types/types";
import { setDataLayerProperty } from "../../utils/setDataLayerProperty";

interface ResultHeadingProps {
  resultQuantity: number;
  query: string;
  type: ListingCategoryEnum;
  correctedQuery: string;
  isPartialHeading?: boolean;
  viewAllUrl?: (view: boolean) => void | undefined;
  handleSearchInsteadClick?: () => void;
  isSearchInsteadClicked?: boolean;
  isRelatedSearch?: boolean;
}
const ResultHeading: React.FC<ResultHeadingProps> = ({
  resultQuantity,
  type,
  query,
  correctedQuery,
  isPartialHeading = false,
  viewAllUrl,
  handleSearchInsteadClick,
  isSearchInsteadClicked,
  isRelatedSearch,
}) => {
  useEffect(() => {
    correctedQuery
      ? setDataLayerProperty("spellCheckedSearchTerm", correctedQuery)
      : setDataLayerProperty("spellCheckedSearchTerm", "");
  }, []);

  return (
    <div className="result-heading-container">
      <div className="result-heading">
        <div className="qa-results-title result-title">
          {!isRelatedSearch ? (
            <p className="qa-result-count result-quantity">{`${resultQuantity} ${
              type === ListingCategoryEnum.STORE ? "store" : "product"
            } results`}</p>
          ) : (
            <p className="qa-result-count result-quantity">
              Here are some related products
            </p>
          )}

          <p className="qa-result-query query">
            for "{correctedQuery ? correctedQuery : query}"
            {!isPartialHeading &&
              correctedQuery &&
              !isSearchInsteadClicked &&
              type === ListingCategoryEnum.PRODUCT && (
                <span
                  className="qa-spellcheck-link result-subtitle"
                  onClick={handleSearchInsteadClick}
                >
                  search instead for {query}
                </span>
              )}
            {!isPartialHeading &&
              correctedQuery &&
              type === ListingCategoryEnum.STORE && (
                <span
                  className="qa-spellcheck-link result-subtitle"
                  onClick={handleSearchInsteadClick}
                >
                  search instead for {query}
                </span>
              )}
          </p>
        </div>
      </div>
      <div className="view-all">
        {viewAllUrl && (
          <span onClick={() => viewAllUrl && viewAllUrl(true)}>
            view all{" "}
            {`${type === ListingCategoryEnum.STORE ? "stores" : "products"}`}
          </span>
        )}
      </div>
    </div>
  );
};
export default ResultHeading;
