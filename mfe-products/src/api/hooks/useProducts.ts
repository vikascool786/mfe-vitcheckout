import { useEffect, useState } from "react";
import { fetchProducts } from "../service/product";
import { PaginationData, Product } from "../../utils/types/types";
import { productPaginationAtom } from "mfeStore/store";
import { useAtom } from "jotai";

export const useProducts = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>();
  const [spellCheckMessages, setSpellCheckMessages] = useState<string>("");

  const [paginationAtom, setPaginationAtom] = useAtom<{
    size: number;
    page: number;
  }>(productPaginationAtom);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string | null | unknown>();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { size, page } = paginationAtom;
        const res = await fetchProducts(query, size, page);
        setProducts(res.hits as Product[]);
        setSpellCheckMessages(res.messages?.spellCheck?.correctedQuery);
        setPagination({
          totalSize: res.totalHits,
          currentPage: page,
          size,
        });
      } catch (error) {
        setErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, [paginationAtom]);

  return { products, pagination, spellCheckMessages, isLoading, errors };
};
