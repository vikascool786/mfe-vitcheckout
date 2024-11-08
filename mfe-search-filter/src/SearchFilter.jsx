import React, { useEffect, useState, useRef, Suspense } from "react";
import { useAtom } from "jotai";
import FilterButton from "./FilterButton/FilterButton";
import "./SearchFilter.scss";
import FilterBox from "./Filterbox/FilterBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faSliders,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { filtersAtom, payloadSortFilterAppliedAtom } from "mfeStore/store";
import {
  bestMatchText,
  checkboxText,
  clearFiltersText,
  departmentText,
  filterTitle,
  greyBtn,
  popSelBtn,
  sortText,
  sortTitle,
  exclusiveBrandsText,
  haveShippingOffersText,
  isOnSaleText,
  isFSAHSAEligibleText,
  popularText,
  storesText,
  catalogIdText,
  priceText,
  labelOneFilter,
} from "./constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import FilterSkeleton from "./components/FilterSkeleton/FilterSkeleton";
import("mfeSearchContainer/ResultHeadingCss");

export default function SearchResults(props) {
  const [filterData, setFilterData] = useState(null);
  const [contextFilter, setContextFilter] = useState(null);
  const [mainFilterData, setMainFilterData] = useState(null);
  const [isFilterShown, setIsFilterShown] = useState(false);
  const [isMainFilter, setIsMainFilter] = useState(false);
  const [isSubFilter, setIsSubFilter] = useState(false);
  const [selectedFilterData, setSelectedFilterData] = useState(null);
  const [filtersValue] = useAtom(filtersAtom);
  const [payloadSortFilterAppliedValue] = useAtom(payloadSortFilterAppliedAtom);
  const [filterApplied, setFilterApplied] = useState({});
  const [selNodeIds, setSelNodeIds] = useState([]);
  const [selStoreIds, setSelStoreIds] = useState([]);
  const [selPrice, setSelPrice] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popularFilters, setPopularFilters] = useState(null);
  const [isSortShown, setIsSortShown] = useState(false);
  const [selSort, setSelSort] = useState(null);
  const [sortData, setSortData] = useState(null);
  const [sortApplied, setSortApplied] = useState(null);
  const [swiperIndex, setSwiperIndex] = useState(0);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [contextFilterAppliedValue, setContextFilterAppliedValue] =
    useState(null);
  const [sortValue, setSortValue] = useState(null);
  const [preSelPopFilters, setPreSelPopFilters] = useState(null);
  const [orgFilterObj, setOrgFilterObj] = useState(null);
  let filters = [];
  let selectedNodeIds = [];
  let selectedStoreIds = [];
  let selectedPrice = [];
  let popularFiltersArr = [];
  let sortDataArr = [];
  const isPopularFilterText = [
    exclusiveBrandsText,
    haveShippingOffersText,
    isOnSaleText,
    isFSAHSAEligibleText,
  ];

  const filterDataHandler = (allFilData, sort = bestMatchText) => {
    let filterObj = {};
    if (allFilData?.filtersApplied) {
      setSelectedFilterData([
        ...allFilData.filtersApplied?.filter(
          (filApp) => !isPopularFilterText.includes(filApp?.filterType)
        ),
      ]);

      allFilData.filtersApplied.forEach((filApp) => {
        if (isPopularFilterText.includes(filApp?.filterType)) {
          filterObj[filApp.filterType] = ["true"];
        } else if (filApp?.filterType === catalogIdText) {
          filApp.selectedOptions?.forEach((selOpt) => {
            selectedStoreIds.push(selOpt.catalogId || selOpt.nodeId);
          });
          filterObj[filApp.filterType] = [...selectedStoreIds];
        } else if (filApp?.filterType === priceText) {
          filApp.selectedOptions?.forEach((selOpt) => {
            selectedPrice.push(selOpt.identifier);
          });
          filterObj[filApp.filterType] = [...selectedPrice];
        } else {
          filApp.selectedOptions?.forEach((selOpt) => {
            selectedNodeIds.push(selOpt.nodeId);
          });
          filterObj["node.id"] = [...selectedNodeIds];
        }
      });
    } else {
      selectedNodeIds = [];
      selectedStoreIds = [];
      selectedPrice = [];
      setSelectedFilterData([]);
    }
    setSelNodeIds(selectedNodeIds);
    setSelStoreIds(selectedStoreIds);
    setSelPrice(selectedPrice);
    setFilterApplied(filterObj);
    setOrgFilterObj(filterObj);
    setPreSelPopFilters(
      Object.fromEntries(
        Object.entries(filterObj).filter(
          ([key]) => key !== ("node.id" || "catalogId" || "price")
        )
      )
    );

    if (allFilData?.regularFilters) {
      allFilData.regularFilters
        ?.filter((rF) => rF.uiType?.toLowerCase() === checkboxText)
        ?.forEach((regFil) => {
          filters.push({
            title: regFil.name,
            content: null,
            type: popularText,
            value: regFil.filterType,
          });
        });

      allFilData.regularFilters?.forEach((regFil) => {
        if (regFil.filterType.toLowerCase() === storesText) {
          filters.push({
            title: regFil.name,
            content: regFil.storeFilterOptions?.map((item) => ({
              id: item.catalogId,
              name: item.catalogName,
              isSelected: selectedStoreIds?.includes(item.catalogId)
                ? true
                : false,
              isStore: true,
            })),
          });
        } else if (regFil.filterType.toLowerCase() === priceText) {
          filters.push({
            title: regFil.name,
            content: regFil.filterOptions?.map((item) => ({
              id: item.identifier,
              name: item.value,
              isSelected: selectedPrice?.includes(item.identifier),
              isPrice: true,
            })),
          });
        } else if (regFil.filterType.toLowerCase() === departmentText) {
          filters.push({
            title: regFil.name,
            content: regFil.departmentOptions?.map((item) => ({
              id: item.nodeId,
              name: item.name,
              isSelected: selectedNodeIds?.includes(item.nodeId) ? true : false,
              catContent: item.filterOptions?.map((it) => ({
                id: it.nodeId,
                name: it.value,
                isSelected: selectedNodeIds?.includes(it.nodeId) ? true : false,
              })),
            })),
          });
        } else if (regFil?.filterType?.toLowerCase() === sortText) {
          regFil?.sortFilterOptions?.forEach((sortOpt) => {
            sortDataArr.push({
              key: sortOpt.identifier,
              name: sortOpt.value,
              isSelected: false,
            });
          });
        } else if (regFil?.uiType?.toLowerCase() !== checkboxText) {
          filters.push({
            title: regFil.name,
            content: regFil.filterOptions?.map((item) => ({
              id: item.nodeId,
              name: item.value,
              isSelected: selectedNodeIds?.includes(item.nodeId) ? true : false,
            })),
          });
        } else {
          popularFiltersArr.push({
            name: regFil.name,
            identifier: regFil.filterType,
            isSelected: Object.keys(filterObj).includes(regFil.filterType)
              ? true
              : false,
          });
        }
      });
      setPopularFilters(popularFiltersArr);
      setFilterData(filters);
      setMainFilterData({
        title: filterTitle,
        content: filters.map((filter) => ({
          name: filter.title,
          type: filter.type || null,
          value: filter.value,
          isSelected: Object.keys(filterObj).includes(filter.value)
            ? true
            : false,
        })),
      });
    }
    setSelSort(sort);
    const contextSort = sortDataArr.map((item) => ({
      ...item,
      isSelected: item.key === sort,
    }));
    setSortData({
      title: sortTitle,
      content: [...contextSort],
    });
    setSortValue(sortDataArr.find((sv) => sv.key === sort)?.name);
  };

  useEffect(() => {
    filterDataHandler(filtersValue, payloadSortFilterAppliedValue);
    setIsLoading(false);
    setSwiperIndex(0);
  }, [filtersValue]);

  useEffect(() => {
    if (contextFilterAppliedValue) {
      handleResults(sortApplied, filterApplied);
    }
  }, [contextFilterAppliedValue]);

  const handleFilterBtnClick = (filterOpts, showMainFilter) => {
    setContextFilter(filterOpts);
    setIsFilterShown(true);
    setIsMainFilter(showMainFilter);
    setIsSubFilter(true);
  };

  const handleMainFilterClick = (content) => {
    let contextFilter = filterData.find(
      (filter) => filter.title === content.name
    );
    if (contextFilter.content) {
      if (contextFilter.title.toLowerCase() === departmentText) {
        contextFilter?.content[0]?.catContent?.forEach((catCon) => {
          catCon.isSelected = false;
        });
      }
      contextFilter?.content?.forEach((c) => {
        c.isSelected = selNodeIds.includes(c.id) ? true : false;
      });
      setContextFilter({ ...contextFilter });
      setIsMainFilter(false);
      setIsSubFilter(false);
    } else {
      const updData = { ...mainFilterData };
      const updObj = updData.content.find(
        (c) => c.value === contextFilter.value
      );
      updObj.isSelected = !updObj.isSelected;
      setMainFilterData(updData);

      const updFilter = { ...filterApplied };
      updFilter[contextFilter.value]
        ? delete updFilter[contextFilter.value]
        : (updFilter[contextFilter.value] = ["true"]);
      setFilterApplied(updFilter);
      handleResults(sortApplied, updFilter);
    }
  };

  const handleSubFilterClick = (content) => {
    if (!content.isSelected) setContextFilterAppliedValue(content);
    const updObj = { ...contextFilter };
    if (updObj?.title.toLowerCase() === departmentText) {
      if (updObj?.content?.length === 1) {
        content.isSelected = true;
        updObj?.content[0]?.catContent?.forEach((catCon) => {
          catCon.isSelected = catCon.name === content.name ? true : false;
        });
      } else {
        updObj.content?.forEach((con) => {
          con.isSelected = con.name === content.name ? true : false;
          con?.catContent?.forEach((catCon) => {
            catCon.isSelected = catCon.name === content.name ? true : false;
          });
        });
      }
    } else {
      updObj?.content?.forEach((c) => {
        c.isSelected = c.name === content.name ? true : false;
      });
    }
    setContextFilter(updObj);
  };

  const handleFilterBack = () => {
    setIsMainFilter(true);
    setContextFilter(mainFilterData);
  };

  const handleFilterClear = () => {
    const updData = { ...contextFilter };
    updData?.content?.forEach((c) => (c.isSelected = false));
    setContextFilter(updData);
  };

  const handleClearBtnClick = async () => {
    setIsLoading(true);
    const res = await props.handleSearchEvent({ "node.id": [] }, bestMatchText);
    setIsLoading(false);
    filterDataHandler(res.filters, bestMatchText);
  };

  const handleResults = async (sortApplied = bestMatchText, filterApplied) => {
    let contextFilterApplied = { ...filterApplied };
    if (contextFilterAppliedValue) {
      if (contextFilterAppliedValue.isStore) {
        if (contextFilterApplied["catalogId"]) {
          contextFilterApplied["catalogId"].push(
            contextFilterAppliedValue?.id?.toString()
          );
          contextFilterApplied["catalogId"] = [
            ...new Set(contextFilterApplied["catalogId"]),
          ];
        } else {
          contextFilterApplied["catalogId"] = [
            contextFilterAppliedValue?.id?.toString(),
          ];
        }
      } else if (contextFilterAppliedValue.isPrice) {
        contextFilterApplied["price"] = [
          contextFilterAppliedValue?.id?.toString(),
        ];
      } else {
        if (contextFilterApplied["node.id"]) {
          contextFilterApplied["node.id"].push(
            contextFilterAppliedValue?.id?.toString()
          );
          contextFilterApplied["node.id"] = [
            ...new Set(contextFilterApplied["node.id"]),
          ];
        } else {
          contextFilterApplied["node.id"] = [
            contextFilterAppliedValue?.id?.toString(),
          ];
        }
      }
    }

    setFilterApplied(contextFilterApplied);
    setIsLoading(true);
    const res = await props.handleSearchEvent(
      contextFilterApplied,
      sortApplied
    );
    setIsLoading(false);
    filterDataHandler(res.filters, sortApplied);
    setIsFilterShown(false);
    setIsSortShown(false);
    setSelSort(sortApplied);
    setContextFilterAppliedValue(null);
  };

  const handleSelFilterRemove = async (remFil, remId) => {
    if (remFil?.filterType !== labelOneFilter) {
      setIsLoading(true);
      let removeFilter;
      if (remFil.filterType === catalogIdText) {
        removeFilter = {
          ...filterApplied,
          catalogId: filterApplied[catalogIdText].filter(
            (fil) => fil !== remId
          ),
        };
      } else if (remFil.filterType === priceText) {
        removeFilter = { ...filterApplied };
        delete removeFilter[priceText];
      } else {
        removeFilter = {
          ...filterApplied,
          "node.id": filterApplied["node.id"].filter((fil) => fil !== remId),
        };
      }

      const res = await props.handleSearchEvent(removeFilter, selSort);
      setIsLoading(false);
      filterDataHandler(res.filters, selSort);
    } else {
      handleClearBtnClick();
    }
  };

  const handleClose = () => {
    setIsFilterShown(false);
    const updData = { ...contextFilter };
    if (updData.title.toLowerCase() === departmentText) {
      updData?.content[0]?.catContent?.forEach((catCon) => {
        catCon.isSelected = false;
      });
    }
    updData?.content?.forEach((c) => {
      c.isSelected =
        [...selNodeIds, ...selStoreIds, ...selPrice].includes(c.id) ||
        Object.keys(preSelPopFilters)?.includes(c.value)
          ? true
          : false;
    });
    setContextFilter(updData);
    setFilterApplied(orgFilterObj);
  };

  const handlePopularFilterClick = async (popFil) => {
    setIsLoading(true);
    let contextPopFilter = popularFilters.map((item) =>
      item.name === popFil.name
        ? { ...item, isSelected: !item.isSelected }
        : item
    );
    setPopularFilters(contextPopFilter);
    const updFilter = { ...filterApplied };
    updFilter[popFil.identifier]
      ? delete updFilter[popFil.identifier]
      : (updFilter[popFil.identifier] = ["true"]);
    setFilterApplied(updFilter);
    const res = await props.handleSearchEvent(updFilter, selSort);
    setIsLoading(false);
    filterDataHandler(res.filters, selSort);
  };

  const handleSubSortClick = (content) => {
    if (!content.isSelected) {
      setSortApplied(content.key);
      const updObj = { ...sortData };
      updObj?.content?.forEach((c) => {
        c.isSelected = c.name === content.name ? true : false;
      });
      setSortData(updObj);
      handleResults(content.key, filterApplied);
    }
  };

  const handleSortClose = () => {
    setIsSortShown(false);
    const updData = { ...sortData };
    updData?.content?.forEach((c) => {
      c.isSelected = selSort === c.key ? true : false;
    });
    setSortData(updData);
    setSortApplied(selSort);
  };

  return (
    <>
      {isLoading || props.isloading ? (
        <div style={{ padding: "30px" }}>
          <FilterSkeleton />
        </div>
      ) : (
        <>
          <div className="qa-filters filter">
            {(filterData && filterData.length) || props.children ? (
              <div className="filter-bound">
                <span>
                  <FilterButton
                    text={filterTitle}
                    prefixIcon={<FontAwesomeIcon icon={faSliders} />}
                    handleClick={(e) =>
                      handleFilterBtnClick(mainFilterData, true)
                    }
                  ></FilterButton>
                </span>
                {popularFilters &&
                  popularFilters
                    ?.filter((pF) => pF.identifier === exclusiveBrandsText)
                    ?.map((popFil) => (
                      <span>
                        <FilterButton
                          className="qa-exclusive-brands"
                          key={popFil.name}
                          text={popFil.name}
                          btnStyle={popFil.isSelected ? popSelBtn : null}
                          handleClick={(e) => handlePopularFilterClick(popFil)}
                        ></FilterButton>
                      </span>
                    ))}
                <span className="slider">
                  <span
                    className="qa-prev nav-button-prev"
                    ref={prevRef}
                    style={{ display: swiperIndex === 0 ? "none" : "flex" }}
                    aria-label="Previous"
                  >
                    <i className="arrow left"></i>
                  </span>
                  <Swiper
                    modules={[Navigation]}
                    slidesPerView={"auto"}
                    onActiveIndexChange={(swiper) => {
                      setSwiperIndex(swiper.activeIndex);
                    }}
                    onInit={(swiper) => {
                      setTimeout(() => {
                        if (
                          prevRef.current &&
                          nextRef.current &&
                          swiper.params.navigation
                        ) {
                          swiper.params.navigation.prevEl = prevRef.current;
                          swiper.params.navigation.nextEl = nextRef.current;
                          swiper.navigation.init();
                          swiper.navigation.update();
                        }
                      });
                    }}
                    navigation
                  >
                    <div>
                      <span>
                        {popularFilters &&
                          popularFilters
                            ?.filter(
                              (pF) => pF.identifier !== exclusiveBrandsText
                            )
                            ?.map((popFil, index) => (
                              <SwiperSlide
                                key={`${popFil.name}-${index}`}
                                style={{ width: "auto", height: "auto" }}
                              >
                                <FilterButton
                                  className="qa-filter-button"
                                  key={popFil.name}
                                  text={popFil.name}
                                  btnStyle={
                                    popFil.isSelected ? popSelBtn : null
                                  }
                                  handleClick={(e) =>
                                    handlePopularFilterClick(popFil)
                                  }
                                />
                              </SwiperSlide>
                            ))}
                      </span>
                      <span>
                        {filterData
                          ?.filter((fD) => fD.type !== popularText)
                          ?.map((filter) => (
                            <SwiperSlide
                              style={{ width: "auto", height: "auto" }}
                            >
                              <FilterButton
                                className="qa-filter-button"
                                key={filter.title}
                                text={filter.title}
                                handleClick={(e) =>
                                  handleFilterBtnClick(filter)
                                }
                              ></FilterButton>
                            </SwiperSlide>
                          ))}
                      </span>
                    </div>
                  </Swiper>
                  <span
                    className="qa-next nav-button-next"
                    ref={nextRef}
                    aria-label="Next"
                  >
                    <i className="arrow right"></i>
                  </span>
                </span>
                <span>
                  <FilterButton
                    className="qa-sort-button"
                    text={sortTitle}
                    prefixIcon={
                      <FontAwesomeIcon icon={faArrowDownUpAcrossLine} />
                    }
                    handleClick={(e) => setIsSortShown(true)}
                    sortValue={sortValue}
                  ></FilterButton>
                </span>
              </div>
            ) : null}
            {(selectedFilterData && selectedFilterData.length) ||
            props.children ? (
              <div className="qa-results-message product-count">
                {props.children}
                <span className="qa-applied-filters">
                  {selectedFilterData?.map((selFilter) =>
                    selFilter?.selectedOptions?.map((selOpt) => (
                      <FilterButton
                        key={selOpt?.value}
                        text={selOpt?.value}
                        suffixIcon={<FontAwesomeIcon icon={faXmark} />}
                        handleSuffixIconClick={(e) =>
                          handleSelFilterRemove(
                            selFilter,
                            selOpt?.nodeId || selOpt?.catalogId
                          )
                        }
                        btnStyle={greyBtn}
                      />
                    ))
                  )}
                </span>
                {selectedFilterData && selectedFilterData.length > 0 && (
                  <span
                    className="qa-clear-filters clear-filter-btn"
                    onClick={handleClearBtnClick}
                  >
                    {clearFiltersText}
                  </span>
                )}
              </div>
            ) : null}
            {isFilterShown &&
              (isMainFilter ? (
                <FilterBox
                  isActionBtnsHidden={true}
                  prefixIcon={<FontAwesomeIcon icon={faSliders} />}
                  contextFilter={contextFilter}
                  actionIcon={<FontAwesomeIcon icon={faChevronRight} />}
                  handleClick={handleMainFilterClick}
                  handleClose={handleClose}
                  // handleSeeResults={(e) =>
                  //   handleResults(e, sortApplied || bestMatchText)
                  // } // commented code
                  isMainFilter={isMainFilter}
                ></FilterBox>
              ) : (
                <FilterBox
                  backBtn={
                    !isSubFilter ? (
                      <FontAwesomeIcon icon={faChevronLeft} />
                    ) : null
                  }
                  contextFilter={contextFilter}
                  actionIcon={<FontAwesomeIcon icon={faCircle} />}
                  handleClick={handleSubFilterClick}
                  handleClose={handleClose}
                  handleBack={handleFilterBack}
                  handleClear={handleFilterClear}
                  // handleSeeResults={(e) =>
                  //   handleResults(e, sortApplied || bestMatchText)
                  // }    // commented code
                ></FilterBox>
              ))}
            {isSortShown && (
              <FilterBox
                contextFilter={sortData}
                prefixIcon={<FontAwesomeIcon icon={faArrowDownUpAcrossLine} />}
                handleClick={handleSubSortClick}
                handleClose={handleSortClose}
                actionIcon={<FontAwesomeIcon icon={faCircle} />}
                // handleSeeResults={(e) => handleResults(e, sortApplied)} // commented code
              ></FilterBox>
            )}
          </div>
        </>
      )}
    </>
  );
}
