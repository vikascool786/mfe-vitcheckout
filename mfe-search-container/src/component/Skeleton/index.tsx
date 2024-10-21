import { useAtomValue } from "jotai";
import React from "react";
import { PaginationData } from "../../utils/types/types";
import { productPaginationAtom, storePaginationAtom } from "mfeStore/store";

const ProductListSkeleton = React.lazy(
  () => import("mfeProducts/ProductListSkeleton")
);
const ProductStoreSkeleton = React.lazy(
  () => import("mfeProducts/ProductStoreSkeleton")
);
const FilterSkeleton = React.lazy(
  () => import("mfeSearchFilter/FilterSkeleton")
);
const Skeleton = () => {
  const prodPaginationAtom = useAtomValue<PaginationData>(
    productPaginationAtom
  );
  const storePaginationAtomValue =
    useAtomValue<PaginationData>(storePaginationAtom);
  return (
    <div style={{ padding: "30px" }}>
      <FilterSkeleton />
      <ProductListSkeleton
        NumberOfTimesTobeRendered={prodPaginationAtom.size}
      />
      <ProductStoreSkeleton
        NumberOfTimesTobeRendered={storePaginationAtomValue.size}
      />
    </div>
  );
};

export default Skeleton;
