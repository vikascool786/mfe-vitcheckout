import { atom } from "jotai";
import { Product, TPagination, ProductStore } from "../utils/types/types";

export const productsAtom = atom<Product[]>([]);
export const productStoreAtom = atom<ProductStore[]>([]);

export const productPaginationAtom = atom<TPagination>({
  size: 10,
  page: 1,
});

export const storePaginationAtom = atom<TPagination>({
  size: 10,
  page: 1,
});

export const productListPaginationAtom = atom<Product[]>([]);

export const setProductPaginationAtom = (page: number, size: number) =>
  atom(null, (get, set) => {
    set(productPaginationAtom, { page, size });
  });

export const setStorePaginationAtom = (page: number, size: number) =>
  atom(null, (get, set) => {
    set(storePaginationAtom, { page, size });
  });

export const productByIdAtom = (id: string) =>
  atom((get) => get(productsAtom)?.find((item) => item.prodId === id));

export const defaultPriceByIdAtom = (prodId: string) =>
  atom((get) => get(productByIdAtom(prodId))?.derived.retailPrice);
