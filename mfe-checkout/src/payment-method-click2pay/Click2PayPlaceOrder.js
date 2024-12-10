/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayPlaceOrder = (function () {

    function handleCheckoutWithC2P(c2pInstance, srcDigitalCardId){
        checkoutWithExistingCard(c2pInstance, srcDigitalCardId);
    }

    function checkoutWithExistingCard(c2pInstance, srcDigitalCardId){
        const params = {
            srcDigitalCardId: srcDigitalCardId,
            windowRef: window.frames['c2pPaymentIframe'],
            checkoutExperience: "WITHIN_CHECKOUT",
            dpaTransactionOptions: {
                "dpaLocale": "en_US",
                "threeDsPreference": "NONE",
                "dpaBillingPreference": "FULL",
                "consumerNameRequested": true,
                "confirmPayment": false
            }
        }
        //debug.log("Mastercard click2pay embedded checkoutWithCard()", params);
        //click2PayLogger.logInfo("initiating checkoutWithCard()");
        //click2PayLogger.logResponse("checkoutWithCard", {}, c2pInstance);
        //checkoutClick2payUtil.openiFrame();
        const checkoutPromise = c2pInstance.checkoutWithCard(params);
        /*checkoutPromise
            .then(response => checkoutWithCardSuccessHandler(response, c2pInstance))
            .catch(error => checkoutWithCardFailedHandler(error))*/
    }

    return {
        handleCheckoutWithC2P
    }
})();

export default Click2PayPlaceOrder;