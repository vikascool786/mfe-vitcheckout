import React, { useRef } from "react";
import "./ProductList.scss";
import Product from "../product/Product";
import ErrorBoundary from "../../error-boundary/ErrorBoundary";
import Pagination from "../../components/Pagination/Pagination";
import { Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { productsAtom, productPaginationAtom } from "mfeStore/store";
import { useAtom, useAtomValue } from "jotai";
import { PaginationData, Product as TProduct } from "../../utils/types/types";
import { GET_BASE_URL } from "../../utils/helpers";
import { ProductListSkeleton } from "../../components/Skeleton";

interface ProductListProps {
  loading?: boolean;
  partial?: boolean;
  customHeading?: React.ReactNode;
}
const ProductList: React.FC<ProductListProps> = React.memo(
  ({ loading = false, partial = false, customHeading = <></> }) => {
    // here partial means its a related search
    const [products, _] = useAtom<TProduct[]>(productsAtom);
    const baseUrl = GET_BASE_URL;
    const prodPaginationValue = useAtomValue<PaginationData>(
      productPaginationAtom
    );

    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

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
            {!partial ? (
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
            ) : (
              <>
                {customHeading}
                <div className="qa-product-results product-list-container-partial">
                  <span className="nav-button-prev-circle" ref={prevRef}>
                    <i className="arrow left-arrow"></i>
                  </span>
                  <Swiper
                    spaceBetween={10}
                    slidesPerView={"auto"}
                    navigation
                    onInit={(swiper) => {
                      setTimeout(() => {
                        if (
                          prevRef.current &&
                          nextRef.current &&
                          swiper.params.navigation
                        ) {
                          //@ts-ignore
                          swiper.params.navigation.prevEl = prevRef.current;
                          //@ts-ignore
                          swiper.params.navigation.nextEl = nextRef.current;
                          swiper.navigation.init();
                          swiper.navigation.update();
                        }
                      });
                    }}
                    modules={[Navigation, Scrollbar]}
                    style={{ padding: "0 5px" }}
                  >
                    {products.map((prod: TProduct, index: number) => (
                      <SwiperSlide
                        key={prod.prodId}
                        style={{ width: "auto", height: "auto" }}
                      >
                        <Product
                          prodPosition={index}
                          key={prod.prodId || index}
                          productData={prod}
                          baseUrl={baseUrl}
                          partial={partial}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <span className="nav-button-next-circle" ref={nextRef}>
                    <i className="arrow right-arrow"></i>
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </ErrorBoundary>
    );
  }
);
export default ProductList;
