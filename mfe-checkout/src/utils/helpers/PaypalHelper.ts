
export const hasPaypalToken = (locationSearch: string): boolean => {
    const queryParams = new URLSearchParams(locationSearch);
    const keyToken = "token";
    const tokenValue = queryParams.get(keyToken);
    return !!tokenValue;
};