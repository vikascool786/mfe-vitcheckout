import { GET_AJAX_ENDPOINT_BASE_URL } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const doFAMOSSessionPing = async (
): Promise<any> => {
    try {
        const FAMOS_PING_URL_PATH = `/ajaxaction/pl/session-touch`;
        const ajaxEndpoint = `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", FAMOS_PING_URL_PATH);
        const ajaxResponse = await axiosInstance(ajaxEndpoint).get("");
        return ajaxResponse.data;
    } catch (error) {
        console.error(`Error during FAMOS session ping`, error);
    }
};