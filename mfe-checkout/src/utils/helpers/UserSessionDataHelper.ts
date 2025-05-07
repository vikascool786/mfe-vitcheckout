import Cookies from "js-cookie";

export const getUserAgent = () => {
    const userAgent = navigator.userAgent;
    return userAgent || "";
};

export const getAmosUserSessionID = () => {
    const AMIDCookie = Cookies.get('AMID');
    return AMIDCookie ? AMIDCookie : "";
}