import { Order } from "../../interfaces/Order";
import { ApiResponse } from "../../interfaces/ShippingMethod";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchOrderDetail = async (cartId: string): Promise<Order> => {
  try {
    const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/cart-universal/v2/carts/id/${cartId}?api_key=${API_KEY}`;
    const orderResponse = await axiosInstance(
      shopperAddressBookApiEndpoint
    ).get<ApiResponse>("");
    return orderResponse.data.response.success.data;
  } catch (error) {
    console.error(`Error getting order detail`, error);
    throw error;
  }
};
