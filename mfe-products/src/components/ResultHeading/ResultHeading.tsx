import React from "react";
import "./ResultHeading.scss";
import { ListingCategoryEnum } from "../../utils/types/types";

interface ResultHeadingProps {
  resultQuantity: number;
  query: string;
  type: ListingCategoryEnum;
  correctedQuery: string;
  isPartialHeading?: boolean;
  viewAllUrl?: boolean;
}
const ResultHeading: React.FC<ResultHeadingProps> = ({
  resultQuantity,
  type,
  query,
  correctedQuery,
  isPartialHeading = false,
  viewAllUrl = false,
}) => {
  return (
    <div className="result-heading-container">
      <div className="result-heading">
        <div className="qa-results-title result-title">
          <p className="qa-result-count result-quantity">{`${resultQuantity} ${
            type === ListingCategoryEnum.STORE ? "store" : "product"
          } results`}</p>
          <p className="qa-result-query query">
            for "{correctedQuery ? correctedQuery : query}"
          </p>
        </div>
        {!isPartialHeading && correctedQuery && (
          <a className="qa-spellcheck-link result-subtitle" href="">
            search instead for {query}
          </a>
        )}
      </div>
      <div className="view-all">
        {viewAllUrl && (
          <>
            view all{" "}
            {`${type === ListingCategoryEnum.STORE ? "stores" : "products"}`}
          </>
        )}
      </div>
    </div>
  );
};
export default ResultHeading;
