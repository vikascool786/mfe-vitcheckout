import React, { useRef } from "react";
import "./ProductList.scss";
import Product from "../product/Product";
import ErrorBoundary from "../../error-boundary/ErrorBoundary";
import Pagination from "../../components/Pagination/Pagination";
import "swiper/css";
import "swiper/css/navigation";
import { productsAtom, productPaginationAtom } from "mfeStore/store";
import { useAtom, useAtomValue } from "jotai";
import { PaginationData, Product as TProduct } from "../../utils/types/types";
import { GET_BASE_URL } from "../../utils/helpers";
import { ProductListSkeleton } from "../../components/Skeleton";

interface ProductListProps {
  loading?: boolean;
}
const ProductList: React.FC<ProductListProps> = React.memo(
  ({ loading = false }) => {
    const [products, _] = useAtom<TProduct[]>(productsAtom);
    const baseUrl = GET_BASE_URL;
    const prodPaginationValue = useAtomValue<PaginationData>(
      productPaginationAtom
    );

    return loading ? (
      <>
        <div style={{ padding: "30px" }}>
          <ProductListSkeleton
            NumberOfTimesTobeRendered={prodPaginationValue.size}
          />
        </div>
      </>
    ) : (
      <ErrorBoundary>
        {products.length > 0 && (
          <div className="qa-product-results product-component-container">
            <>
              <div className="product-list-container">
                {products.map((prod: any, index: number) => (
                  <Product
                    prodPosition={index}
                    key={prod.prodId || index}
                    productData={prod}
                    baseUrl={baseUrl}
                  />
                ))}
              </div>
              {prodPaginationValue && (
                <Pagination
                  totalResult={prodPaginationValue.totalSize}
                  currentPage={prodPaginationValue.currentPage}
                  pageSize={prodPaginationValue.size}
                  paginationAtom={productPaginationAtom}
                />
              )}
            </>
          </div>
        )}
      </ErrorBoundary>
    );
  }
);
export default ProductList;
