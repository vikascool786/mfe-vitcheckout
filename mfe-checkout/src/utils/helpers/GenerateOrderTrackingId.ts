import Cookies from 'js-cookie';

export const generateOrderTrackingId = (trackingData: Map<string, string>) => {
    if(getForterCookie().length > 0){
        trackingData.set("forterToken", getForterCookie());
    }
    if(getOTSourceCookie().length > 0){
        trackingData.set("OT_SOURCE", getOTSourceCookie());
    }
    let trackingString = '';
    Array.from(trackingData.entries()).forEach(([key, value], index, array) => {
        trackingString += `${key}=${value}`;
        if (index < array.length - 1) {
            trackingString += '&';
        }
    });
    if (window.location.href.includes('isguestcheckout=true')) {
        trackingString += '&isguestcheckout=true';
    }
    return trackingString;
};

const getForterCookie = () => {
    const forterCookie = Cookies.get('forterToken');
    return forterCookie ? forterCookie : "";
}

const getOTSourceCookie = () => {
    const otSourceCookie = Cookies.get('OT_SOURCE');
    return otSourceCookie ? otSourceCookie : "";
}