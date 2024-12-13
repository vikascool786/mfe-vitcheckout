import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { ApiResponse } from "../../interfaces/ShippingMethod";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export interface OrderResponse {
  response: Response;
  meta_data: MetaData;
}

export interface Response {
  errors: Errors;
  success: Success;
}

export interface Errors {
  message: string;
  collection_name: string;
  code: number;
  developer_message: string;
}

export interface Success {
  data: Order;
}

export interface Data {}

export interface MetaData {
  status: string;
  status_code: number;
  status_text: string;
}

const shopperOrderAPIEndpoint = (cartId: string) =>
  `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${API_KEY}`;

const shopperBuildOrderAPIEndpoint = `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts?api_key=${API_KEY}`;

const shopperUpdateOrderEndpoint = (cartId: string) => `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts/id/${cartId}`

const commitOrderEndpoint = (cartId: string) =>`${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${API_KEY}`

export const fetchOrderDetail = async (cartId: string): Promise<Order> => {
  try {
    const orderResponse = await axiosInstance(
      shopperOrderAPIEndpoint(cartId)
    ).get<ApiResponse>("");
    return orderResponse.data.response.success.data;
  } catch (error) {
    console.error(`Error getting order detail`, error);
    throw error;
  }
};

export const buildOrder = async (
    orderPayload: ChangeOrder
): Promise<OrderResponse> => {
  try {
    const orderResponse = await axiosInstance(
        shopperBuildOrderAPIEndpoint
    ).post("", orderPayload);
    return orderResponse.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const changeOrder = async (
  changeStorePayload: ChangeOrder,
  cartId: string
): Promise<OrderResponse> => {
  try {
    const orderResponse = await axiosInstance(
        shopperUpdateOrderEndpoint(cartId)
    ).put("", changeStorePayload);
    return orderResponse.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const commitOrder = async (
    cartId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance(
        commitOrderEndpoint(cartId)
    ).post("", {});
    console.log("commit order successfully: " + JSON.stringify(response));
    return response;
  } catch (error) {
    console.error("Unable to commit order", error);
  }
};
