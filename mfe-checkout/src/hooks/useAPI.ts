import { useState, useEffect } from "react";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { Order } from "../interfaces/Order";

type IAPIMethod = "GET" | "POST" | "PUT" | "PATCH";

export const useApi = <T>(
  url: string,
  method: IAPIMethod,
  body?: any,
  options?: AxiosRequestConfig
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [order, setOrder] = useState<Order>();
  const [isComplete, setIsComplete] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response: AxiosResponse<T> = await axios(url, options);
      setData(response.data);
    } catch (error) {
      setError(error as AxiosError);
    }

    setIsLoading(false);
    setIsComplete(true);
  };

  const postData = async (body: any, customOptions?: AxiosRequestConfig) => {
    if (!body) {
      return;
    }
    setIsLoading(true);

    try {
      const response: AxiosResponse<T> = await axios.post(
        url,
        body,
        customOptions ? customOptions : options
      );
      setData(response.data);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setError(error as AxiosError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    switch (method) {
      case "GET":
        fetchData();
        break;
      case "POST":
        postData(body);
        break;

      default:
        fetchData();
        break;
    }
  }, []);

  return { data, isLoading, error, fetchData, postData, isComplete };
};
