import { ApiResponse, ResponseData } from "../../interfaces/ShippingMethod";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const fetchOrderDetail = async (): Promise<ResponseData> => {
  try {
    const shopperAddressBookApiEndpoint = `${GET_API_ENDPOINT_BASE_URL}/checkout-universal/v1/checkouts/id/cart_1182228987_W_USA_USA_ENG?api_key=${API_KEY}`;
    const orderResponse = await axiosInstance(
      shopperAddressBookApiEndpoint
    ).get<ApiResponse>("");
    return orderResponse.data.response.success.data;
  } catch (error) {
    console.error(
      `Error getting order detail`,
      error
    );
    throw error;
  }
};

