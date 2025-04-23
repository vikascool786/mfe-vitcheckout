const couponAliasMap: { [couponCode: string]: string } = {
    "SURVEY10": "10% Off"
};

export const isHiddenCouponCode = (couponCode?: string): boolean => {
    if (!couponCode) return false;
    return couponCode.toUpperCase() in couponAliasMap;
};

export const getCouponAliasForCouponCode = (couponCode: string): string | undefined => {
    return couponAliasMap[couponCode.toUpperCase()];
};