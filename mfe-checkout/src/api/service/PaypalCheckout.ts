import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY, GET_PAYPAL_RETURN_URL,
} from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const getPaypalToken = async (
  shopperId: string,
  isRecurring: boolean,
  totalAmountDue: number,
  isGuest: boolean,
) => {
  try {
    const response = await axiosInstance(
    `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shoppingcart-checkouts/v1/Checkout/Paypal/${shopperId}/Token?creditFlow=false&hideShipping=true&markFlow=true&returnURL=${getPaypalReturnUrl(isRecurring, isGuest)}&cancelURL=${getPaypalCancelUrl(isRecurring, isGuest)}&api_key=${GET_API_KEY()}&total=${totalAmountDue}&isRecurring=${isRecurring}`
    ).get("");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getPaypalReturnUrl = (isRecurring: boolean, isGuest: boolean) => {
  const paypalReturnUrl = new URL(GET_PAYPAL_RETURN_URL());
  if (isRecurring) {
    paypalReturnUrl.searchParams.set("isRecurring", "true");
  }
  if (isGuest) {
    paypalReturnUrl.searchParams.set("isguestcheckout", "true");
  }

  return encodeURIComponent(paypalReturnUrl.toString());
}

const getPaypalCancelUrl = (isRecurring: boolean, isGuest: boolean) => {
  const paypalCancelUrl = new URL(GET_PAYPAL_RETURN_URL());
  paypalCancelUrl.searchParams.set("status", "cancel");
  if (isRecurring) {
    paypalCancelUrl.searchParams.set("isRecurring", "true");
  }
  if (isGuest) {
    paypalCancelUrl.searchParams.set("isguestcheckout", "true");
  }

  return encodeURIComponent(paypalCancelUrl.toString());
}