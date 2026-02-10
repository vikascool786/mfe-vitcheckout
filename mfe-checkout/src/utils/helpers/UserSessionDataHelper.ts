import Cookies from "js-cookie";

export const getUserAgent = () => {
    const userAgent = navigator.userAgent;
    return userAgent || "";
};

export const getAmosUserSessionID = () => {
    const AMIDCookie = Cookies.get('AMID');
    return AMIDCookie ? AMIDCookie : "";
}

export const getPortalId = () => {
    const portalNameCookie = Cookies.get('PORTAL_NAME');
    return portalNameCookie ? portalNameCookie : "";
}