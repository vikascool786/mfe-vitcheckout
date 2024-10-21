import React from "react";
import "./FilterSkeleton.scss";

const FilterSkeleton = () => {
  return (
    <>
      <div className="skeleton-container">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            className={`skeleton-block ${index % 2 === 1 ? "large" : "small"}`}
            key={index}
          ></div>
        ))}
      </div>
      <div className="additional-skeleton-block"></div>
    </>
  );
};

export default FilterSkeleton;
