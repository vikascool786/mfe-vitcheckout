import { GET_AJAX_ENDPOINT_BASE_URL } from "../../utils/urlResolver";
import axiosInstance from "../axios";
import { ShoppingCart } from "../../interfaces/ShoppingCart";

export const getShoppingCart = async (
): Promise<ShoppingCart> => {
    try {
        const FAMOS_SHOPPING_CART = `/ajaxaction/shoppingCart`;
        const ajaxEndpoint = `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", FAMOS_SHOPPING_CART);
        const ajaxResponse = await axiosInstance(ajaxEndpoint).get("");
        return ajaxResponse.data;
    } catch (error) {
        console.error(`Error creating new autoship with order`, error);
        return DEFAULT_SHOPPING_CART;
    }
};

const DEFAULT_SHOPPING_CART: ShoppingCart = {
    shoppingCartData: {
        totalItems: 0,
        totals: {
            prices: {
                priceDisplay: "",
                priceValue: 0,
            },
            rewards: {
                cashbackDisplay: "",
                cashbackValue: 0,
                customerIncentivePointsDisplay: "",
                customerIncentivePoints: 0,
                bvDisplay: "",
                bvValue: 0,
                ibvDisplay: "",
                ibvValue: 0,
                ibvOnly: 0,
            },
        },
    },
};
