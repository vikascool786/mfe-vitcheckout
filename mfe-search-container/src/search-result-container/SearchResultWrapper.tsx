import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchResultContainer from "./SearchResultContainer";
import {
  payloadFilterAppliedAtom,
  appConfigAtom,
  productPaginationAtom,
  payloadSortFilterAppliedAtom,
} from "mfeStore/store";
import { useSetAtom } from "jotai";
import { PaginationData, searchAppConfig } from "../utils/types/types";
import { GET_API_ENDPOINT_BASE_URL, GET_API_MODE } from "../utils/urlResolvers";
import { useContentStrings } from "../api/hooks/useContentStrings";
import Skeleton from "../component/Skeleton";

const SearchResultWrapper = (appConfig: searchAppConfig) => {
  const [isPopState, setPopState] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const setPayloadFilterApplied = useSetAtom(payloadFilterAppliedAtom);
  const setPayloadSortFilterAppliedValue = useSetAtom(
    payloadSortFilterAppliedAtom
  );
  const setAppConfig = useSetAtom(appConfigAtom);
  const setProdPaginationAtom = useSetAtom(productPaginationAtom);
  const fetchData = async () => {
    const location = window.location.href;

    const parsedString = location.match(/\/s\/[^ ]+/);

    if (parsedString && parsedString[0]) {
      const requestBody = { url: parsedString[0].replaceAll("+", " ") };
      const requestConvertPath =
        "/page-template/v1/seo/product-search/url-to-request-converter";
      const apiEndpoint = GET_API_ENDPOINT_BASE_URL(GET_API_MODE()).replace(
        "{{path}}",
        requestConvertPath
      );
      try {
        const response = await axios.post(apiEndpoint, requestBody);

        if (response.data.productSearchRequest) {
          const result = JSON.parse(response.data.productSearchRequest);
          if (result?.filters) {
            setPayloadFilterApplied(result.filters);
          }
          if (result?.sort) {
            setPayloadSortFilterAppliedValue(result.sort);
          }
          if (parseInt(result?.page) > 0) {
            setProdPaginationAtom((prev: PaginationData) => ({
              ...prev,
              currentPage: parseInt(result?.page),
            }));
          } else {
            setProdPaginationAtom((prev: PaginationData) => ({
              ...prev,
              currentPage: 1,
            }));
          }

          setData(response.data.query);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  //const { getContent } = useContentStrings();

  useEffect(() => {
    //getContent();
    fetchData();
    appConfig &&
      setAppConfig({
        countryCode: appConfig.countryCode,
        languageCode: appConfig.languageCode,
        siteType: appConfig.siteType,
        pcId: appConfig.pcId,
        portalId: appConfig.portalId,
        sessionId: appConfig.sessionId,
        siteId: appConfig.siteId
      });
    const handlePopState = () => {
      setLoading(true);
      setPopState(true);
      fetchData();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  if (loading) return <Skeleton />;
  if (!data) return <div>No results found.</div>;

  return (
    <SearchResultContainer
      search={data}
      isPopState={isPopState}
      setPopState={setPopState}
    />
  );
};

export default SearchResultWrapper;
