import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY, GET_PAYPAL_RETURN_URL,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const getPaypalToken = async (
  shopperId: string,
  isRecurring: boolean,
  totalAmountDue: number
) => {
  try {
    const response = await axiosInstance(
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/Paypal/${shopperId}/Token?creditFlow=false&hideShipping=true&markFlow=true&returnURL=${getPaypalReturnUrl(isRecurring)}&cancelURL=${getPaypalCancelUrl(isRecurring)}&api_key=${GET_API_KEY()}&total=${totalAmountDue}&isRecurring=${isRecurring}`
    ).get("");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getPaypalReturnUrl = (isRecurring: boolean) => {
  const paypalReturnUrl = GET_PAYPAL_RETURN_URL();
  const recurringQueryParam = isRecurring ? "?isRecurring=true" : "";
  return encodeURIComponent(paypalReturnUrl + recurringQueryParam);
}

const getPaypalCancelUrl = (isRecurring: boolean) => {
  const paypalReturnUrl = GET_PAYPAL_RETURN_URL();
  const cancelQueryParams = isRecurring ? "?isRecurring=true&status=cancel" : "?status=cancel";
  return encodeURIComponent(paypalReturnUrl + cancelQueryParams);
}