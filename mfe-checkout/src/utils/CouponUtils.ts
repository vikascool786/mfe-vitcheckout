const hiddenCouponList: string[] = ["SURVEY10"];

export const hideCouponCode = (coupon: string): boolean => {
    return hiddenCouponList.includes(coupon.toUpperCase());
};