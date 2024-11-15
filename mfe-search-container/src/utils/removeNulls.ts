import { Product } from "./types/types";

export function removeNulls(arr: Product[]) {
  return arr.filter((item: Product) => item !== null);
}
