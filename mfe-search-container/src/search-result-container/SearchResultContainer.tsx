import React, {
  ReactElement,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
  SetStateAction,
} from "react";
import {
  Module,
  filters,
  Product,
  PaginationData,
  ListingCategoryEnum,
} from "../utils/types/types";
import "./SearchResultContainer.scss";
import { useSearchResults } from "../api/hooks/useSearchResults";
import { useAtom, useSetAtom } from "jotai";
import {
  productStoreAtom,
  productsAtom,
  filtersAtom,
  productPaginationAtom,
  storePaginationAtom,
  payloadFilterAppliedAtom,
  payloadSortFilterAppliedAtom,
} from "mfeStore/store";
import RemoteWrapper from "../mfe-load/RemoteWrapper";
import "mfeProducts/styles";
import { PRODUCT_LIST, PRODUCT_STORE_LIST } from "../constant";
import { NoResult, ResultHeading } from "../component";
import {
  setAddressBarUrlWithPush,
  setAddressBarUrlWithReplace,
} from "../utils/setAddressBarUrl";
import { setDataLayerProperty } from "../utils/setDataLayerProperty";
import { Spinner } from "react-bootstrap";
import Skeleton from "../component/Skeleton";
import { useContentStrings } from "../api/hooks/useContentStrings";
import Feedback from "../component/Feedback/Feedback";
import ErrorPage from "../component/ErrorPage/ErrorPage";
import { MAX_STORE_SIZE_ON_PARTIAL } from "../utils/helpers";

const ProductList = React.lazy(() => import("mfeProducts/ProductList"));
const ProductStoreList = React.lazy(
  () => import("mfeProducts/ProductStoreList")
);
const SearchFilter = React.lazy(() => import("mfeSearchFilter/SearchFilter"));
interface SearchResultContainerProps {
  search?: string;
  isPopState?: boolean;
  setPopState: React.Dispatch<SetStateAction<boolean>>;
}

const SearchResultContainer: React.FC<SearchResultContainerProps> = ({
  search = "",
  isPopState,
  setPopState,
}) => {
  const getSearchQuery = () => {
    const slug = window.location.pathname;
    const regEx = /[^/]+$/g;
    const match = slug.match(regEx);
    if (match) {
      const query = match[0];
      return query;
    }
    return "vitamins";
  };

  const searchQuery: string = search || getSearchQuery();
  const setProducts = useSetAtom(productsAtom);
  const [payloadFilterAppliedValue, setPayloadFilterApplied] = useAtom<filters>(
    payloadFilterAppliedAtom
  );
  const setProductStores = useSetAtom(productStoreAtom);
  const [totalResults, setTotalresults] = useState(0);
  const [prodPaginationAtom, setProdPaginationAtom] = useAtom<PaginationData>(
    productPaginationAtom
  );

  const [storePaginationAtomValue, setStorePaginationAtomValue] =
    useAtom<PaginationData>(storePaginationAtom);
  const prevPageRef = useRef<number>(prodPaginationAtom.currentPage);
  const [payloadSortFilterAppliedValue, setPayloadSortFilterAppliedValue] =
    useAtom<string>(payloadSortFilterAppliedAtom);
  const [filtersAtomValue, setFiltersAtomValue] = useAtom(filtersAtom);
  const [isViewStore, setIsViewStore] = useState(false);
  const [isSearchInsteadClicked, setSearchInsteadClicked] = useState(false);

  const [paginationResetFromFilter, setPaginationResetFromFilter] =
    useState(false);
  const {
    loading,
    error,
    products,
    apiBaseUrl,
    prodPagination,
    prodStrPagination,
    productStores,
    moduleOrder,
    isProductListloading,
    isProductStoreListloading,
    fetchMultiple,
    fetchSpecific,
    fetchSpecificWithResponse,
  } = useSearchResults();

  useEffect(() => {
    fetchMultiple({ searchQuery });
  }, []);

  const dataLayerSet = () => {
    setDataLayerProperty("searchTerm", searchQuery);
    setDataLayerProperty("searchResultsCount", products?.totalResults);
    setDataLayerProperty("searchPageNumber", products?.pagination?.page);
    setDataLayerProperty("searchSort", payloadSortFilterAppliedValue);
    setDataLayerProperty("topVIDs", "");
    setDataLayerProperty("spellCheckedSearchTerm", "");
    setDataLayerProperty("numberOfStoreResults", 0);
    setDataLayerProperty(
      "topProds",
      products?.hits
        .slice(0, 30)
        .map((item: any) => item.prodId)
        .join(",")
    );
    setDataLayerProperty(
      "topOPs",
      products?.hits
        .slice(0, 30)
        .map((item: any) => item.supplemental?.goldenRecord?.opContainerId)
        .join(",")
    );
    setDataLayerProperty(
      "searchFilterNames",
      products?.filters?.filtersApplied
        ?.map((filter: filters) => {
          const { selectedOptions } = filter;
          return selectedOptions?.map((option) => {
            if ((filter.name as any) === "Shipping Offers") {
              return `${option.value}-${option.value}`;
            } else if ((filter.name as any) === "Exclusive Brands") {
              return `${filter.name}-true`;
            } else {
              const id = option.nodeId || option.catalogId || option.identifier;
              return `${option.value.toLowerCase()}-${id}`;
            }
          });
        })
        .flat()
        .join(", ")
    );
    const formattedModuleRank = moduleOrder?.moduleOrder
      .map((item) => {
        if (item === "products") return "Product";
        if (item === "stores") return "Store";
        return item;
      })
      .join("-");

    setDataLayerProperty("moduleRank", formattedModuleRank);
  };

  useEffect(() => {
    if (products) {
      setProducts(products?.hits ?? []);
      setTotalresults(products?.totalResults);
      setFiltersAtomValue(products?.filters);
      if (isPopState) {
        setAddressBarUrlWithReplace(products.searchUrl);
      } else {
        setAddressBarUrlWithPush(products.searchUrl);
      }
      setProdPaginationAtom(prodPagination);
      dataLayerSet();
      const searchBar: any = document.getElementById("quick-search-input");
      if (searchBar) {
        searchBar.value = searchQuery;
      }
    }
  }, [products]);

  useEffect(() => {
    if (productStores) {
      setProductStores(productStores?.hits ?? []);
      setDataLayerProperty(
        "numberOfStoreResults",
        productStores?.totalHits || 0
      );
      setDataLayerProperty(
        "topVIDs",
        productStores?.hits
          .slice(0, 30)
          .map((item: any) => item.volumeId)
          .join(",")
      );
    }
  }, [productStores]);

  useEffect(() => {
    if (prodPaginationAtom.currentPage !== prevPageRef.current) {
      if (prodPaginationAtom && !paginationResetFromFilter) {
        setPopState(false);
        setDataLayerProperty(
          "searchPageNumber",
          prodPaginationAtom.currentPage
        );
        fetchSpecific(searchQuery, PRODUCT_LIST, isSearchInsteadClicked);
        prevPageRef.current = prodPaginationAtom.currentPage;
      }
    }
  }, [prodPaginationAtom.currentPage]);

  useEffect(() => {
    if (paginationResetFromFilter) {
      setProdPaginationAtom((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      setPaginationResetFromFilter(false);
    }
  }, [paginationResetFromFilter]);

  useEffect(() => {
    if (productStores) {
      fetchSpecific(searchQuery, PRODUCT_STORE_LIST);
    }
  }, [storePaginationAtomValue.currentPage, storePaginationAtomValue.size]);

  const viewAllStore = useCallback(
    (view: boolean) => {
      if (view) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
      if (!view) {
        // resetting to initial state
        if (storePaginationAtomValue.currentPage !== 1) {
          setStorePaginationAtomValue((ps) => ({
            ...ps,
            currentPage: 1,
          }));
        }
      }
      setIsViewStore(view);
    },
    [storePaginationAtomValue.currentPage]
  );

  const { contentStrings, getString } = useContentStrings();

  const isRelatedSearch = useMemo(
    () =>
      products?.messages?.relatedSearchApplied?.isZeroResultOnOriginalSearch,
    [products?.messages?.relatedSearchApplied?.isZeroResultOnOriginalSearch]
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorPage />;
  if (!moduleOrder) return <p>No order found!</p>;
  if (contentStrings) {
    console.log("Content Strings", contentStrings);
    console.log("String", getString("addToCart"));
  }

  const handleSearchEvent = async (
    payloadFilterApplied: filters,
    sortApplied?: string
  ) => {
    const res = await fetchSpecificWithResponse(
      true,
      searchQuery,
      PRODUCT_LIST,
      payloadFilterApplied,
      sortApplied,
      isSearchInsteadClicked
    );
    sortApplied && setPayloadSortFilterAppliedValue(sortApplied);
    sortApplied && setDataLayerProperty("searchSort", sortApplied);
    setPaginationResetFromFilter(true);
    setProdPaginationAtom({
      totalSize: res?.totalResults,
      currentPage: 1,
      size: prodPaginationAtom.size,
    });
    prevPageRef.current = 1;
    setPayloadFilterApplied(payloadFilterApplied);
    setProducts(res.hits as Product[]);
    setTotalresults(res?.totalResults);
    if (isPopState) {
      setAddressBarUrlWithReplace(products.searchUrl);
    } else {
      setAddressBarUrlWithPush(products.searchUrl);
    }
    return res;
  };

  const handleSearchInsteadClick = async () => {
    setSearchInsteadClicked(true);
    const res = await fetchSpecificWithResponse(
      true,
      searchQuery,
      PRODUCT_LIST,
      payloadFilterAppliedValue,
      payloadSortFilterAppliedValue,
      true
    );
    setProducts(res.hits as Product[]);
    setTotalresults(res?.totalResults);
    if (isPopState) {
      setAddressBarUrlWithReplace(products.searchUrl);
    } else {
      setAddressBarUrlWithPush(products.searchUrl);
    }
    setFiltersAtomValue(res?.filters);
  };

  const ModuleMapper = (index: number): Record<Module, ReactElement> => ({
    products: (
      <RemoteWrapper>
        <>
          {filtersAtomValue && !isRelatedSearch && (
            <SearchFilter
              handleSearchEvent={handleSearchEvent}
              isloading={isProductListloading}
            >
              <ResultHeading
                resultQuantity={totalResults}
                isPartialHeading={
                  products?.messages?.spellCheck?.correctedQuery ? false : true
                }
                query={searchQuery}
                type={ListingCategoryEnum.PRODUCT}
                correctedQuery={products?.messages?.spellCheck?.correctedQuery}
                handleSearchInsteadClick={handleSearchInsteadClick}
                isSearchInsteadClicked={isSearchInsteadClicked}
              />
            </SearchFilter>
          )}
          <ProductList
            partial={
              products?.messages?.relatedSearchApplied
                ?.isZeroResultOnOriginalSearch
            }
            loading={isProductListloading}
            correctedQuery={products?.messages?.spellCheck?.correctedQuery}
            actualKeyword={searchQuery}
            customHeading={
              <ResultHeading
                resultQuantity={totalResults}
                isPartialHeading={
                  products?.messages?.spellCheck?.correctedQuery ? false : true
                }
                query={searchQuery}
                type={ListingCategoryEnum.PRODUCT}
                correctedQuery={products?.messages?.spellCheck?.correctedQuery}
                handleSearchInsteadClick={handleSearchInsteadClick}
                isSearchInsteadClicked={isSearchInsteadClicked}
                isRelatedSearch={isRelatedSearch}
              />
            }
          />
        </>
      </RemoteWrapper>
    ),
    stores: (
      <RemoteWrapper>
        <ProductStoreList
          pagination={prodStrPagination!}
          partial
          loading={isProductStoreListloading}
        >
          <ResultHeading
            resultQuantity={productStores?.totalHits}
            isPartialHeading={true}
            query={searchQuery}
            type={ListingCategoryEnum.STORE}
            correctedQuery={products?.messages?.spellCheck?.correctedQuery}
            viewAllUrl={
              prodStrPagination.totalSize > MAX_STORE_SIZE_ON_PARTIAL
                ? viewAllStore
                : undefined
            }
          />
        </ProductStoreList>
      </RemoteWrapper>
    ),
  });
  return (
    <div className="search-result-container">
      <div
        className={`qa-search search-result-container-view ${
          isViewStore ? "hide-view" : ""
        }`}
      >
        <NoResult
          keyword={searchQuery}
          productStores={productStores}
          products={products}
          moduleOrder={moduleOrder?.moduleOrder}
        />

        {moduleOrder?.moduleOrder.map((mod, index) => (
          <div key={mod}>{ModuleMapper(index)[mod]}</div>
        ))}
      </div>
      <Spinner />
      <div className={`product-stores ${isViewStore ? "store-full-view" : ""}`}>
        <button
          className="back-to-product-button"
          onClick={() => viewAllStore(false)}
        >
          <i className="arrow left-arrow"></i>Back to Product Results
        </button>
        <RemoteWrapper>
          <ProductStoreList
            pagination={prodStrPagination!}
            partial={false}
            keyword={searchQuery}
            correctedKeyword={products?.messages?.spellCheck?.correctedQuery}
            loading={isProductStoreListloading}
          >
            <ResultHeading
              resultQuantity={productStores?.totalHits}
              isPartialHeading={true}
              query={searchQuery}
              type={ListingCategoryEnum.STORE}
              correctedQuery={products?.messages?.spellCheck?.correctedQuery}
            />
          </ProductStoreList>
        </RemoteWrapper>
      </div>
      <Feedback />
    </div>
  );
};

export default SearchResultContainer;
