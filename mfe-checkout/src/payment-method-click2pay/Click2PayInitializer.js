/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayInitializer = (function(){

    function init(initParams){
        console.log("initialize c2p");
        const click2payInstance = new Click2Pay();
        const initPromise = click2payInstance.init(initParams);
        initPromise
            .then((response) => initSuccessHandler(response, click2payInstance))
            .catch((error) => initFailedHandler(error))
    }

    async function initHandler (click2payInstance, initParams) { // this method will return a promise
        try {
            const promiseResolvedPayload = await click2payInstance.init(initParams) // No other library methods should be invoked until `init` resolves
            console.log("init handler success");
            // add success handler logic here
            // or
            // promiseResolvedHandler(promiseResolvedPayload)
        } catch (promiseRejectedPayload) {
            console.log("init handler failed");
            // add error handler logic here
            // or
            // promiseRejectedHandler(promiseRejectedPayload)
        }
    }

    function initFailedHandler(error){
        const errorMessage = error.message;
        Click2PayLogger.logInfo("init failed message: " + errorMessage);
    }

    function initSuccessHandler(response, c2pInstance){
        console.log("success: " + response);
        Click2PayLogger.logResponse("init", response, c2pInstance);
    }

    return {
        init,
        initHandler
    }
})();

export default Click2PayInitializer;