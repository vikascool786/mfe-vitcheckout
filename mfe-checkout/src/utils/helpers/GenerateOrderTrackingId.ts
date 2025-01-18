import Cookies from 'js-cookie';

export const generateOrderTrackingId = (trackingData: Map<string, string>) => {
    if(getForterCookie().length > 0){
        trackingData.set("forterToken", getForterCookie());
    }
    let trackingString = '';
    Array.from(trackingData.entries()).forEach(([key, value], index, array) => {
        trackingString += `${key}=${value}`;
        if (index < array.length - 1) {
            trackingString += '&';
        }
    });
    return trackingString;
};

const getForterCookie = () => {
    const forterCookie = Cookies.get('forterToken');
    return forterCookie ? forterCookie : "";
}