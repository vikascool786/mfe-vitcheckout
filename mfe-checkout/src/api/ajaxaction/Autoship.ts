import { GET_AJAX_ENDPOINT_BASE_URL } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const createAutoshipUrl = async (
    shopperId: string,
    orderId: string,
): Promise<any> => {
    try {
        const FAMOS_CREATE_AUTOSHIP_URL_PATH = `/ajaxaction/create-autoship/${shopperId}?orderId=${orderId}`;
        const ajaxEndpoint = `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", FAMOS_CREATE_AUTOSHIP_URL_PATH);
        const ajaxResponse = await axiosInstance(ajaxEndpoint).get("");
        return ajaxResponse.data;
    } catch (error) {
        console.error(`Error creating new autoship with order`, error);
    }
};