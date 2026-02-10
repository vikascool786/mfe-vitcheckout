import { getOrderValidatePromoCode } from "../../api/service/PromoCodeAPI";

export const validateSurveyCoupon = async (
    pcid: string,
    total: number,
    hasTakenHealthSurvey: boolean,
    cartId: string,
) => {
    if (hasTakenHealthSurvey) {
        try {
            const response = await getOrderValidatePromoCode(
                cartId,
                "SURVEY10",
                total,
                pcid,
            );
            const canRedeem =
                response &&
                response?.isCouponValid === "1" &&
                (response?.svrMessage?.length ?? 0) <= 0;
            if (canRedeem) {
                return ["SURVEY10"];
            }
        } catch (error) {
            console.error("Error validating survey coupon", error);
        }
    }
    return [];
};
