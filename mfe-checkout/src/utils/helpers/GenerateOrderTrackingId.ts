
export const generateOrderTrackingId = (trackingData: Map<string, string>) => {
    let trackingString = '';
    Array.from(trackingData.entries()).forEach(([key, value], index, array) => {
        trackingString += `${key}=${value}`;
        if (index < array.length - 1) {
            trackingString += '&';
        }
    });
    return trackingString;
};
