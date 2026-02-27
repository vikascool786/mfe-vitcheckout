import axios, { InternalAxiosRequestConfig } from "axios";

const axiosInstance = (baseUrl: string) => {
    const instance = axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Add LTV Header for Adobe calls when LTV environment
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const isLTV = window.__MFE_RUNTIME__?.isLTV === true;

            if (isLTV && isAdobeAPIRequest(config)) {
                config.params = config.params || {};
                config.params["adobe_environment"] = "ltv";
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
};

function isAdobeAPIRequest(config: any): boolean {
    return config.baseURL?.includes("api2.shop.com") || config.baseURL?.includes("api2.mashop.com");
}

export default axiosInstance;
