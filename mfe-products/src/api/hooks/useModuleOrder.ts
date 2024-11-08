import { useEffect, useState } from "react";
import { fetchModuleOrder } from "../service/module-order";
import { log } from "console";
import { ModuleRanker } from "../../utils/types/types";

export const useModuleOrder = (keyword: string) => {
  const [moduleOrder, setModuleOrder] = useState<ModuleRanker>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string | null | unknown>();

  useEffect(() => {
    const getModuleOrder = async () => {
      try {
        const res = await fetchModuleOrder(keyword);
        const rankerData = res.data;
        rankerData.modules.pop(); // remove giftcards
        setModuleOrder(rankerData);
      } catch (error) {
        setErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    getModuleOrder();
  }, []);

  return { moduleOrder, isLoading, errors };
};
