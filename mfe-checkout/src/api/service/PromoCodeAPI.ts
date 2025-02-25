import { GET_DSB_MA } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const getOrderValidatePromoCode = async (
    pcid: string,
    distId: string,
    couponCode: string,
): Promise<any> => {
    try {
        const postData = {
            "couponCode": `${couponCode}`,
            "pcID": `${pcid}`,
            "maVendorCode": "00USA",
            "countryCode": "USA",
            "langCode": "ENG",
            "siteType": "SHP",
            "distID": `${distId}`,
            "orderAmt": "",
            "partyID": "",
            "shipCountry": "USA"
        };
        console.log("post data: " + JSON.stringify(postData));
        const orderValidatePromoCodeEndpoint = `${GET_DSB_MA()}/dataEngine/rest/dataretrieval/redback/dmc/ORDER/coupon/getOrderValidatePromoCode`;
        const orderValidatePromoCodeResponse = await axiosInstance(orderValidatePromoCodeEndpoint).post("", postData, {
            headers: { "Content-Type": "application/json" },
        });
        return orderValidatePromoCodeResponse.data;
    } catch (error) {
        console.error(`Error getting orderValidatePromoCode pcid: ${pcid}`, error);
    }
};