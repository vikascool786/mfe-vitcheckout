import React, { useRef } from "react";
import ProductStore from "../product-store/ProductStore";
import ErrorBoundary from "../../error-boundary/ErrorBoundary";
import "./ProductStoreList.scss";
import Pagination from "../../components/Pagination/Pagination";
import { Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { productStoreAtom, storePaginationAtom } from "mfeStore/store";
import {
  ListingCategoryEnum,
  PaginationData,
  ProductStore as TProductStore,
} from "../../utils/types/types";
import { useAtom } from "jotai";
import { ProductStoreSkeleton } from "../../components/Skeleton";

import("mfeSearchContainer/ResultHeadingCss");

interface ProductStoreListProps {
  pagination: PaginationData;
  partial?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
}
const ProductStoreList: React.FC<ProductStoreListProps> = ({
  pagination,
  partial = false,
  children,
  loading,
}) => {
  const [productStores, _] = useAtom<TProductStore[]>(productStoreAtom);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return loading ? (
    <>
      <ProductStoreSkeleton NumberOfTimesTobeRendered={pagination.size} />
    </>
  ) : (
    <ErrorBoundary>
      {productStores.length > 0 && (
        <div className="qa-store-results product-store-component-container">
          {children && children}
          {!partial ? (
            <>
              <div className="product-store-list-container">
                {productStores.map((prodStore: any, index: number) => (
                  <ProductStore
                    position={index}
                    key={prodStore.prodId || index}
                    productStoreData={prodStore}
                  />
                ))}
              </div>
              {pagination && (
                <Pagination
                  totalResult={pagination.totalSize}
                  currentPage={pagination.currentPage}
                  pageSize={pagination.size}
                  paginationAtom={storePaginationAtom}
                />
              )}
            </>
          ) : (
            <div className="product-store-list-container-partial">
              <span className="nav-button-prev-circle" ref={prevRef}>
                <i className="arrow left-arrow"></i>
              </span>
              <Swiper
                spaceBetween={20}
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
                style={{ padding: "12px 5px" }}
              >
                {productStores.map((prodStore: any, index: number) => (
                  <SwiperSlide
                    key={prodStore.prodId || index}
                    style={{ width: "auto", height: "auto" }}
                  >
                    <ProductStore
                      position={index}
                      key={prodStore.prodId || index}
                      productStoreData={prodStore}
                      partial
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <span className="nav-button-next-circle" ref={nextRef}>
                <i className="arrow right-arrow"></i>
              </span>
            </div>
          )}
        </div>
      )}
    </ErrorBoundary>
  );
};
export default ProductStoreList;
