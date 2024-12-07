import { ChangeOrder } from "../../interfaces/ChangeOrder";
import { Order } from "../../interfaces/Order";
import { ApiResponse } from "../../interfaces/ShippingMethod";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

const shopperOrderAPIEndpoint = (cartId: string) =>
  `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts/id/${cartId}?api_key=${API_KEY}`;

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
): Promise<Order> => {
  try {
    const orderResponse = await axiosInstance(
      shopperOrderAPIEndpoint(changeStorePayload.id)
    ).put("", changeStorePayload);
    return orderResponse.data.response.success.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
