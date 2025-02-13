/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayInitializer = (function(){

    async function initHandler (click2payInstance, initParams) { // this method will return a promise
        try {
            const promiseResolvedPayload = await click2payInstance.init(initParams) // No other library methods should be invoked until `init` resolves
        } catch (promiseRejectedPayload) {
            console.error("init handler failed");
            Click2PayLogger.logInfo("init failed message: " + promiseRejectedPayload.message);
        }
    }

    return {
        initHandler
    }
})();

export default Click2PayInitializer;