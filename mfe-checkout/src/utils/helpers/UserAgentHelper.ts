import { getUserAgent } from "./UserSessionDataHelper";

export const isIOSSafari = (): boolean => {
    const userAgent = getUserAgent();
    return /iP(hone|od|ad)/.test(userAgent) &&
        /Safari/.test(userAgent) &&
        !/CriOS|FxiOS|EdgiOS/.test(userAgent);
};