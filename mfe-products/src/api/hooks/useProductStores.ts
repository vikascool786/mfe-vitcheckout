import { useEffect, useState } from "react";
import { fetchProductStores } from "../service/product-store";
import { PaginationData, ProductStore } from "../../utils/types/types";
import { storePaginationAtom } from "mfeStore/store";
import { useAtom } from "jotai";

export const useProductStores = (keyword: string) => {
  const [productStores, setProductStores] = useState<ProductStore[]>([]);
  const [pagination, setPagination] = useState<PaginationData>();
  const [paginationAtom, setPaginationAtom] = useAtom<{
    size: number;
    page: number;
  }>(storePaginationAtom);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string | null | unknown>();

  useEffect(() => {
    const getProductStores = async () => {
      try {
        const { size, page } = paginationAtom;
        const res = await fetchProductStores(keyword, size, page);
        setProductStores(res.hits);
        setPagination({
          totalSize: res.totalHits,
          size: size,
          currentPage: page,
        });
      } catch (error) {
        setErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    getProductStores();
  }, [storePaginationAtom]);

  return { productStores, pagination, isLoading, errors };
};
