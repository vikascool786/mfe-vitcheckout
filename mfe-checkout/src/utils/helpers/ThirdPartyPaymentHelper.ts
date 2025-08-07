import { hasPaypalToken } from "./PaypalHelper";
import { isSezzleSelectedPayment } from "./SezzleHelper";

export const isThirdPartyCallback = (locationSearch: string): boolean => {
    return hasPaypalToken(locationSearch) || isSezzleSelectedPayment(locationSearch);
};