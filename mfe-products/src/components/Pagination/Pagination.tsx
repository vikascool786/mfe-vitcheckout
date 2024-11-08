import React, { useMemo } from "react";
import "./Pagination.scss";
import { useAtom, PrimitiveAtom } from "jotai";
import { queryDispatchAtom } from "mfeStore/store";
import { TPagination } from "../../utils/types/types";

const PaginationInterval = 5;

interface PaginationProps {
  currentPage: number;
  totalResult: number;
  pageSize: number;
  paginationAtom: PrimitiveAtom<TPagination>;
}
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResult,
  pageSize,
  paginationAtom,
}) => {
  const maxLimit = Math.ceil(totalResult / pageSize);
  const pageNumber: number[] = useMemo(() => {
    return Array.from({ length: maxLimit }, (v, k) => k + 1);
  }, [totalResult, pageSize]);

  // const [, dispatch] = useAtom(queryDispatchAtom);
  const [paginationState, setPaginationState] = useAtom(paginationAtom);
  const pagination = () => {
    if (maxLimit <= PaginationInterval && currentPage <= maxLimit) {
      const pNumber = Array.from({ length: maxLimit }, (v, k) => k + 1);
      return (
        <div className="page-number-container">
          {pNumber.map((pn) => (
            <span
              key={pn}
              className={currentPage === pn ? "current" : ""}
              onClick={() => onPageChange(pn)}
            >
              {pn}
            </span>
          ))}
        </div>
      );
    }
    if (maxLimit > PaginationInterval && currentPage < PaginationInterval) {
      const pNumber = Array.from(
        { length: PaginationInterval },
        (v, k) => k + 1
      );
      return (
        <div className="page-number-container">
          {pNumber.map((pn) => (
            <span
              key={pn}
              className={currentPage === pn ? "current" : ""}
              onClick={() => onPageChange(pn)}
            >
              {pn}
            </span>
          ))}
          <span className="page-delimeter-container">
            <span className="page-delimeter">...</span>
            <span
              className="qa-next arrow-container page-right"
              onClick={() => onPageChange(currentPage + PaginationInterval)}
            >
              <span className="arrow right-arrow hide-arrow"></span>
            </span>
          </span>
          <span key={maxLimit} onClick={() => onPageChange(maxLimit)}>
            {maxLimit}
          </span>
        </div>
      );
    }
    if (maxLimit > PaginationInterval && currentPage >= PaginationInterval) {
      const arr = [currentPage - 2, currentPage - 1, currentPage];
      if (currentPage + 1 <= maxLimit) arr.push(currentPage + 1);
      if (currentPage + 2 < maxLimit) arr.push(currentPage + 2);
      const isLastItemMaxLimit =
        currentPage + 1 === maxLimit ||
        currentPage + 2 == maxLimit ||
        currentPage === maxLimit;
      return (
        <div className="page-number-container">
          <>
            <span
              key={1}
              onClick={() => onPageChange(1)}
              style={{ marginRight: 0 }}
            >
              {1}
            </span>
            <span className="page-delimeter-container">
              <span
                className="arrow-container page-left"
                onClick={() =>
                  onPageChange(Math.abs(currentPage - PaginationInterval))
                }
              >
                <span className="qa-prev arrow left-arrow hide-arrow"></span>
              </span>
              <span className="page-delimeter">...</span>
            </span>
          </>
          {arr.map((pn) => (
            <span
              key={pn}
              className={currentPage === pn ? "current" : ""}
              onClick={() => onPageChange(pn)}
            >
              {pn}
            </span>
          ))}
          {!isLastItemMaxLimit && (
            <>
              <span className="page-delimeter-container">
                <span className="page-delimeter">...</span>
                <span
                  className="arrow-container page-right"
                  onClick={() =>
                    onPageChange(Math.abs(currentPage + PaginationInterval))
                  }
                >
                  <span className="arrow right-arrow hide-arrow"></span>
                </span>
              </span>
              <span key={maxLimit} onClick={() => onPageChange(maxLimit)}>
                {maxLimit}
              </span>
            </>
          )}
        </div>
      );
    }
  };

  const onPageChange = (pn: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    //  dispatch({ type: "PAGINATION", payload: pn });
    setPaginationState((ps) => ({
      ...ps,
      currentPage: pn,
    }));
  };
  const isBackVisible = pageNumber.length > 1 && currentPage > pageNumber[0]!;
  const isNextVisible =
    pageNumber.length > 1 && currentPage < pageNumber[pageNumber.length - 1]!!;

  return (
    <div className="qa-pagination pagination-container">
      {isBackVisible && (
        <div
          className="qa-prev page-prev"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span className="nav-button-prev-circle">
            <i className="arrow left-arrow"></i>
          </span>
        </div>
      )}
      {pagination()}
      {isNextVisible && (
        <div
          className="qa-next page-next"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="nav-button-next-circle">
            <i className="arrow right-arrow"></i>
          </span>
        </div>
      )}
    </div>
  );
};
export default Pagination;
