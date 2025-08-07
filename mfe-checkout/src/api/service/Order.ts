import { ChangeOrder, Shipping } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { ApiResponse } from "../../interfaces/ShippingMethod";
import {
  GET_API_KEY,
  GET_API_ENDPOINT_BASE_URL_ONLY,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";
import { getInitialBuildOrderData } from "../../checkout/CheckoutContainer";

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
  `${GET_API_ENDPOINT_BASE_URL_ONLY()}/checkout-universal/v1/checkouts?api_key=${apiKey}`;

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
    // console.log("error", error);
    throw error;
  }
};

export const buildInitialGuestOrder = async (
    cartId: string,
    portalId: string,
    pcid: string,
    shipAddress: Shipping | undefined | null,
): Promise<OrderResponse> => {
  let buildOrderPayload = getInitialBuildOrderData(
      cartId,
      portalId,
      pcid
  );
  if(shipAddress){
    buildOrderPayload.shipping = {
      first: shipAddress.first,
      last: shipAddress.last,
      address1: shipAddress.address1,
      address2: shipAddress.address2,
      address3: shipAddress.address3,
      address4: shipAddress.address4,
      address5: shipAddress.address5,
      address6: shipAddress.address6,
      address7: shipAddress.address7,
      city: shipAddress.city,
      state: shipAddress.state,
      zip: shipAddress.zip,
      phone: shipAddress.phone,
      isPoBox: shipAddress.isPoBox,
      country: shipAddress.country
    }
  }
  return buildOrder(buildOrderPayload);
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
    // console.log("error", error);
    throw error;
  }
};

export const commitOrder = async (cartId: string): Promise<any> => {
  try {
    const response = await axiosInstance(commitOrderEndpoint(cartId)).post(
      "",
      {}
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const deleteUniversalOrder = async (cartId: string): Promise<any> => {
  try {
    await axiosInstance(shopperOrderAPIEndpoint(cartId)).delete("");
  } catch (error) {
    console.error(`Error deleting universal order`, error);
    throw error;
  }
};

//removing product from cart
export const removeProductFromCart = async (
  cartId: string,
  productHash: string
): Promise<any> => {
  const API_ENDPOINT = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/cart-universal/v2/carts/id/${cartId}/product_hash/${productHash}?api_key=${GET_API_KEY()}`;

  try {
    const response = await axiosInstance(API_ENDPOINT).delete("");
  } catch (error) {
    console.error("Error removing product from cart", error);
    throw error;
  }
};

//updating product item quantity
export const updateProductQty = async (
  cartId: string,
  walletData: any
): Promise<any> => {
  const API_ENDPOINT = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/cart-universal/v2/carts/id/${cartId}?api_key=${GET_API_KEY()}`;

  const response = await axiosInstance(API_ENDPOINT).put("", walletData);
  return response;
};
