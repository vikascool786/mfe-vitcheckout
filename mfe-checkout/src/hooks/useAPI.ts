import { useState, useEffect } from "react";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosInstance from "../api/axios"
import { Order } from "../interfaces/Order";

type IAPIMethod = "GET" | "POST" | "PUT" | "PATCH";

export const useApi = <T>(
  url: string,
  method: IAPIMethod,
  body?: any,
  options?: AxiosRequestConfig,
  enabled: boolean = true
) => {
  const api = axiosInstance(url);

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [order, setOrder] = useState<Order>();
  const [isComplete, setIsComplete] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response: AxiosResponse<T> = await api.request({
        url: "",
        method,
        ...options,
      });
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
      const response: AxiosResponse<T> = await api.request({
        url: "",
        method: "POST",
        data: body,
        ...(customOptions ?? options),
      });
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
    if (!enabled) {
      setIsComplete(true);
      return;
    }

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
  }, [enabled]);

  return { data, isLoading, error, fetchData, postData, isComplete };
};
