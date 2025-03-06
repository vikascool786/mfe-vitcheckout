import { GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const getOrderValidatePromoCode = async (
    cartId: string,
    couponCode: string,
    total: number,
): Promise<any> => {
    try {
        const postData = {
            id: cartId,
            coupon: couponCode,
            total: total
        };
        const orderValidatePromoCodeEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/checkout-universal/v1/coupons?api_key=${GET_API_KEY()}`;
        const orderValidatePromoCodeResponse = await axiosInstance(orderValidatePromoCodeEndpoint).post("", postData);
        return orderValidatePromoCodeResponse.data;
    } catch (error) {
        console.error(`Error getting orderValidatePromoCode coupon: ${couponCode} cartId: ${cartId}`, error);
    }
};