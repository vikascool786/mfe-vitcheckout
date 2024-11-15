import { atom } from "jotai";
import { atomWithReducer } from "jotai/utils";
import { BEST_MATCH_TEXT } from "./constant";

// Shared state values
export const countValue = atom(0);
export const countArray = atom([]);
export const searchResults = atom([]);

// Shared computed values
export const arrayAverage = atom((get) => {
  const array = get(countArray);
  const sum = array.reduce((acc, curr) => acc + curr, 0);
  const average = sum / array.length || 0;
  return average;
});

export const productStoreAtom = atom([]);
export const productsAtom = atom([]);
export const hitsAtom = atom([]);
export const filtersAtom = atom({});
export const contentStringsAtom = atom({});

export const productPaginationAtom = atom({
  size: 40,
  currentPage: 1,
});

export const storePaginationAtom = atom({
  size: 40,
  currentPage: 1,
});

export const payloadFilterAppliedAtom = atom({});
export const payloadSortFilterAppliedAtom = atom(BEST_MATCH_TEXT);
export const apiOptionsAtom = atom((get) => {
  const { filterApplied, skipCatClassifier } = get(apiOptionsParamsAtom);
  return apiOptionsHandler(filterApplied, skipCatClassifier);
});

export const appConfigAtom = atom({
  countryCode: "",
  languageCode: "",
  siteType: "",
  pcId: "",
  portalId: "",
  sessionId: "",
  siteId: ""
});

export const apiOptionsParamsAtom = atom({
  filterApplied: {},
  skipCatClassifier: false,
});

const apiOptionsHandler = (filterApplied, skipCatClassifier = false) => ({
  from: 0,
  query: atom(null, (get) => {
    get(queryAtom);
  }),
  size: 25,
  siteType: "SHP",
  languageCode: "ENG",
  countryCode: "USA",
  page: 1,
  weblevel: 0,
  aggregations: [
    "node.category.level1.id",
    "node.category.level2.id",
    "node.brand.id",
    "node.attribute.id",
    "node.id",
  ],

  filters: filterApplied,
  fields: ["prodId", "product", "personalizedAttributes"],
  userId: "1000432395",
  sort: "BEST_MATCH",
  skipCategoryClassifier: skipCatClassifier,
});

export const queryAtom = atom({
  page: 1,
  size: 10,
  filters: [],
});

export const queryReducer = (state, action) => {
  console.log("inside reducer", action);
  switch (action.type) {
    case "PAGINATION":
      return { ...state, page: action.payload };
    case "FILTERSAPPLIED":
      return { ...state, filters: action.payload };
    default:
      return state;
  }
};

export const queryReducerAtom = atomWithReducer(
  {
    page: 1,
    size: 10,
    filters: {},
  },
  queryReducer
);

export const queryDispatchAtom = atom(
  (get) => undefined,
  (get, set, action) => set(queryReducerAtom, action)
);
