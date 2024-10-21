import {
  PRODUCT_STORE_LIST,
  MODULE_ORDER,
  PRODUCT_LIST,
} from "./../../constant/index";
import { useState, useCallback, useMemo } from "react";
import { fetchProducts } from "../service/product";
import { fetchProductStores } from "../service/product-store";
import { fetchModuleOrder } from "../service/module-order";
import {
  TPagination,
  filters,
  ModuleRanker,
  FetchMultipleParams,
  searchAppConfig,
  ModuleOrder,
} from "../../utils/types/types";
import { useAtom, useAtomValue } from "jotai";
import {
  payloadFilterAppliedAtom,
  productPaginationAtom,
  storePaginationAtom,
  appConfigAtom,
} from "mfeStore/store";
import {
  GET_API_ENDPOINT_BASE_URL,
  GET_API_MODE,
} from "../../utils/urlResolvers";

export const useSearchResults = () => {
  const [productPagination] = useAtom<TPagination>(productPaginationAtom);
  const [storePagination] = useAtom<TPagination>(storePaginationAtom);
  const [payloadFilterApplied] = useAtom<filters>(payloadFilterAppliedAtom);
  const appConfigValue = useAtomValue<searchAppConfig>(appConfigAtom);
  const [loading, setLoading] = useState(true);
  const [isProductListloading, setIsProductListLoading] = useState(false);
  const [isProductStoreListloading, setIsProductStoreListLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productListresponse, setProductListresponse] = useState({
    products: null as any,
    prodPagination: { totalSize: 0, currentPage: 0, size: 0 },
  });
  const [productStoreListresponse, setProductStoreListresponse] = useState({
    productStores: null as any,
    prodStrPagination: { totalSize: 0, currentPage: 0, size: 0 },
  });
  const [moduleOrderResponse, setModuleOrderResponse] = useState({
    moduleOrder: null as ModuleRanker | null,
  });

  const apiMode = useMemo(() => GET_API_MODE(), []);
  const apiBaseUrl = useMemo(() => {
    return GET_API_ENDPOINT_BASE_URL(apiMode);
  }, []);

  const apiBaseUrlModuleRanker = useMemo(
    () => GET_API_ENDPOINT_BASE_URL(apiMode, true),
    []
  );

  const fetchModuleData = async (searchQuery: string) => {
    const moduleResponse = await fetchModuleOrder(
      searchQuery,
      apiBaseUrlModuleRanker
    );
    const rankerData = moduleResponse.data;

    setModuleOrderResponse({
      moduleOrder: {
        keyword: searchQuery,
        moduleOrder:
          rankerData.moduleOrder.length > 0
            ? rankerData.moduleOrder
            : ["products", "stores"],
      },
    });
    return rankerData.moduleOrder;
  };

  const fetchProductData = async (
    searchQuery: string,
    spellCheck?: boolean
  ) => {
    const productResponse = await fetchProducts(
      apiBaseUrl,
      searchQuery,
      productPagination.size,
      productPagination.currentPage,
      appConfigValue,
      payloadFilterApplied,
      undefined,
      spellCheck
    );
    setProductListresponse({
      products: productResponse,
      prodPagination: {
        totalSize: productResponse.totalResults,
        currentPage: productPagination.currentPage,
        size: productPagination.size,
      },
    });
  };
  const fetchProductStoreData = async (searchQuery: string) => {
    const storeResponse = await fetchProductStores(
      apiBaseUrl,
      searchQuery,
      storePagination.size,
      storePagination.currentPage,
      appConfigValue
    );
    setProductStoreListresponse({
      productStores: storeResponse,
      prodStrPagination: {
        totalSize: storeResponse.totalHits,
        currentPage: storePagination.currentPage,
        size: storePagination.size,
      },
    });
  };
  const fetchMultiple = async ({
    searchQuery,
    fetchModules = true,
    fetchProductsData = true,
    fetchStores = true,
  }: FetchMultipleParams) => {
    setLoading(true);
    try {
      let moduleOrder: ModuleOrder = [];
      if (fetchModules) {
        moduleOrder = await fetchModuleData(searchQuery);
      }

      if (moduleOrder.indexOf("products") !== -1)
        await fetchProductData(searchQuery);
      if (moduleOrder.indexOf("stores") !== -1)
        await fetchProductStoreData(searchQuery);
    } catch (err) {
      console.log("fecthMultiple", err);
      setError("Something went wrong!");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecific = async (
    searchQuery: string,
    action:
      | typeof MODULE_ORDER
      | typeof PRODUCT_LIST
      | typeof PRODUCT_STORE_LIST,
    spellCheck?: boolean
  ) => {
    try {
      if (action === MODULE_ORDER) {
        await fetchModuleData(searchQuery);
      } else if (action === PRODUCT_LIST) {
        setIsProductListLoading(true);
        await fetchProductData(searchQuery, spellCheck);
      } else if (action === PRODUCT_STORE_LIST) {
        setIsProductStoreListLoading(true);
        await fetchProductStoreData(searchQuery);
      }
    } catch (err) {
      console.log("fecthSpecific", err);
      setError("Something went wrong!");
      setIsProductListLoading(false);
      setIsProductStoreListLoading(false);
    } finally {
      setIsProductListLoading(false);
      setIsProductStoreListLoading(false);
    }
  };

  const fetchSpecificWithResponse = async (
    isFromFilter: boolean,
    searchQuery: string,
    action:
      | typeof MODULE_ORDER
      | typeof PRODUCT_LIST
      | typeof PRODUCT_STORE_LIST,
    payloadFilterAppliedValue?: filters,
    sort?: string,
    spellCheck?: boolean
  ) => {
    let response = null;

    try {
      if (action === MODULE_ORDER) {
        response = await fetchModuleData(searchQuery);
      } else if (action === PRODUCT_LIST) {
        setIsProductListLoading(true);
        response = await fetchProducts(
          apiBaseUrl,
          searchQuery,
          productPagination.size,
          isFromFilter ? 1 : productPagination.currentPage,
          appConfigValue,
          payloadFilterAppliedValue,
          sort,
          spellCheck
        );

        setProductListresponse({
          products: response,
          prodPagination: {
            totalSize: response.totalResults,
            currentPage: productPagination.currentPage,
            size: productPagination.size,
          },
        });
      } else if (action === PRODUCT_STORE_LIST) {
        setIsProductStoreListLoading(true);
        response = await fetchProductStoreData(searchQuery);
      }
    } catch (err) {
      console.log("fecthSpecificWithResponse", err);
      setError("Something went wrong!");
    } finally {
      setIsProductListLoading(false);
      setIsProductStoreListLoading(false);
    }
    return response;
  };
  return {
    loading,
    isProductListloading,
    isProductStoreListloading,
    error,
    ...productListresponse,
    ...productStoreListresponse,
    ...moduleOrderResponse,
    apiBaseUrl,
    fetchMultiple,
    fetchSpecific,
    fetchSpecificWithResponse,
  };
};
