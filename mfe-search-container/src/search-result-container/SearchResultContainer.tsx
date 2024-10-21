import React, {
  ReactElement,
  useCallback,
  useEffect,
  useState,
  useRef,
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
import { setAddressBarUrl } from "../utils/setAddressBarUrl";
import { setDataLayerProperty } from "../utils/setDataLayerProperty";
import { Spinner } from "react-bootstrap";
import Skeleton from "../component/Skeleton";
import { useContentStrings } from "../api/hooks/useContentStrings";
import ErrorPage from "../component/ErrorPage/ErrorPage";

const ProductList = React.lazy(() => import("mfeProducts/ProductList"));
const ProductStoreList = React.lazy(
  () => import("mfeProducts/ProductStoreList")
);
const SearchFilter = React.lazy(() => import("mfeSearchFilter/SearchFilter"));

interface SearchResultContainerProps {
  search?: string;
}

const SearchResultContainer: React.FC<SearchResultContainerProps> = ({
  search = "",
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
    setDataLayerProperty("searchSort", "best-match");
    setDataLayerProperty("topVIDs", "");
    setDataLayerProperty("spellCheckedSearchTerm", "");
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
        ?.map((filter: filters) => filter.name)
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
      setAddressBarUrl(products.searchUrl);
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

  const viewAllStore = useCallback(() => {
    if (!isViewStore) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    !isViewStore
      ? setStorePaginationAtomValue((ps) => ({ ...ps, size: 36 }))
      : setStorePaginationAtomValue((ps) => ({
          ...ps,
          size: 10,
          currentPage: 1,
        }));

    setIsViewStore((prev) => !prev);
  }, []);

  const { contentStrings, getString } = useContentStrings();

  if (loading) return <Skeleton />;
  if (error) return <ErrorPage />;
  if (!moduleOrder) return <p>No order found!</p>;
  if (contentStrings) {
    console.log("Content Strings", contentStrings);
    console.log("String", getString("addToCart"));
  }

  const isProdEmpty = products?.hits?.length === 0;
  const isStoresEmpty = productStores?.hits?.length === 0;

  const showNoResult =
    (moduleOrder?.moduleOrder?.indexOf("products") !== -1 && isProdEmpty) ||
    (moduleOrder?.moduleOrder?.indexOf("stores") !== -1 &&
      isStoresEmpty &&
      isProdEmpty);
  const noResultMessage = () => {
    const concateMessage =
      isProdEmpty && isStoresEmpty
        ? "store or product"
        : isProdEmpty
        ? "product"
        : isStoresEmpty
        ? "store"
        : "";
    return `Sorry. We could not find any ${concateMessage} matches.`;
  };

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
    setAddressBarUrl(res.searchUrl);
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
    setAddressBarUrl(res.searchUrl);
    setFiltersAtomValue(res?.filters);
  };

  const ModuleMapper = (index: number): Record<Module, ReactElement> => ({
    products: (
      <RemoteWrapper>
        <>
          {filtersAtomValue && (
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
          <ProductList partial={false} loading={isProductListloading} />
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
              prodStrPagination.totalSize > prodStrPagination.size
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
      {showNoResult && !isViewStore && (
        <NoResult keyword={searchQuery} message={noResultMessage()} />
      )}
      <div
        className={`qa-search search-result-container-view ${
          isViewStore ? "hide-view" : ""
        }`}
      >
        {moduleOrder?.moduleOrder.map((mod, index) => (
          <div key={mod}>{ModuleMapper(index)[mod]}</div>
        ))}
      </div>
      <Spinner />
      <div className={`product-stores ${isViewStore ? "store-full-view" : ""}`}>
        <button className="back-to-product-button" onClick={viewAllStore}>
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
    </div>
  );
};

export default SearchResultContainer;
