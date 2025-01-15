import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { ApiResponse } from "../../interfaces/ShippingMethod";
import {
  GET_API_KEY,
  GET_API_ENDPOINT_BASE_URL_ONLY,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";
import axios from "axios";

export interface OrderResponse {
  response: Response;
  meta_data: MetaData;
}

export interface Response {
  errors: Errors;
  success: Success;
}

export interface Notification {
  reason: string;
  errorCode: string;
}

export interface Errors {
  message: string;
  collection_name: string;
  code: number;
  developer_message: string;
}

export interface Success {
  data: Order;
  notifications: Notification[];
}

export interface Data { }

export interface MetaData {
  status: string;
  status_code: number;
  status_text: string;
}

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

const shopperOrderAPIEndpoint = (cartId: string) =>
  `${apiDomain}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${apiKey}`;

const shopperBuildOrderAPIEndpoint = `${apiDomain}/checkout-universal/v1/checkouts?api_key=${apiKey}`;

const shopperUpdateOrderEndpoint = (cartId: string) =>
  `${GET_API_ENDPOINT_BASE_URL_ONLY()}/checkout-universal/v1/checkouts/id/${cartId}`;

const commitOrderEndpoint = (cartId: string) =>
  `${GET_API_ENDPOINT_BASE_URL_ONLY()}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${GET_API_KEY()}`;

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
    ).post("", changeStorePayload);
    return orderResponse.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const commitOrder = async (cartId: string): Promise<any> => {
  try {
    const response = await axiosInstance(commitOrderEndpoint(cartId)).post(
      "",
      {}
    );
    console.log("commit order successfully: " + JSON.stringify(response));
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data.errors.length) {
        throw new Error(error.response?.data.errors[0].message);
      } else {
        throw error;
      }
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
};

export const removeProductFromCart = async (
  cartId: string,
  productHash: string
): Promise<any> => {
  const API_ENDPOINT = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/cart-universal/v2/carts/id/${cartId}/product_hash/${productHash}?api_key=c7f5de6a77644516b24c68fc4ac173fc`;

  try {
    const response = await axiosInstance(API_ENDPOINT).delete("");

    console.log(response);
  } catch (error) {
    console.error("Error removing product from cart", error);
    throw error;
  }
};
