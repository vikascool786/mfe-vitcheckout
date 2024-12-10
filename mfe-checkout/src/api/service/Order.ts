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

export const changeOrder = async (
  changeStorePayload: ChangeOrder
): Promise<OrderResponse> => {
  try {
    const orderResponse = await axiosInstance(
      shopperBuildOrderAPIEndpoint
    ).post("", changeStorePayload);
    return orderResponse.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
