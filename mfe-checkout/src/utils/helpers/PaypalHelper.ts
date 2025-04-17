
export const hasPaypalToken = (locationSearch: string): boolean => {
    const queryParams = new URLSearchParams(locationSearch);
    const keyToken = "token";
    const tokenValue = queryParams.get(keyToken);
    return !!tokenValue;
};

const hasPaypalPayerId = (locationSearch: string): boolean => {
    const queryParams = new URLSearchParams(locationSearch);
    const keyPayerID = "PayerID";
    const payerId = queryParams.get(keyPayerID);
    return !!payerId;
};

export const isSuccessfulPaypalCallback = (locationSearch: string): boolean => {
    if(hasPaypalToken(locationSearch)){
        return hasPaypalPayerId(locationSearch);
    } else {
        return false;
    }
};