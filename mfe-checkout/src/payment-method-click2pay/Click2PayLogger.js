/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import axiosInstance from "../api/axios";
import { GET_AJAX_ENDPOINT_BASE_URL } from "../utils/urlResolver";

const Click2PayLogger = (function () {
    const loggerEndpoint = '/ajaxaction/click2pay/logger';

    function getLoggerEndpoint() {
        return `${GET_AJAX_ENDPOINT_BASE_URL()}`.replace("{{path}}", loggerEndpoint);
    }

    function logResponse(method, responseData, instanceData) {
        let updatedResponse = buildResponseData(responseData, instanceData);
        sendToLogs(method, updatedResponse, "");
    }

    function logInfo(logInfo) {
        sendToLogs("info", {}, logInfo);
    }

    function buildResponseData(responseData, instanceData) {
        let logInfo = {};
        if (instanceData) {
            logInfo.srciTransactionId = instanceData.srciTransactionId;
            logInfo.traceId = instanceData.traceId;
        }
        if (responseData) {
            logInfo.srcCorrelationId = responseData.srcCorrelationId;
            logInfo.checkoutActionCode = responseData.checkoutActionCode;
            if (responseData.headers) {
                logInfo.merchantTransactionId = responseData.headers['merchant-transaction-id'];
                logInfo.flowId = responseData.headers['x-src-cx-flow-id'];
            }
            logInfo.reason = responseData.reason;
            logInfo.message = responseData.message;
        }
        return logInfo;
    }

    function sendToLogs(method, response, message) {
        let msg = message ? message : "";
        let loggerUrl = `${getLoggerEndpoint()}?method=${method}&info=${msg}`;
        axiosInstance(loggerUrl)
            .post("", response)
            .then((r) => {
                console.log("logging c2p");
            })
            .catch((err) => console.log(err));
    }

    return {
        logResponse,
        logInfo
    }
})();

export default Click2PayLogger;