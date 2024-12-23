/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayPlaceOrder = (function () {
    const CUSTOM_ATTR_SELECTED_CARD = "data-selected-card";
    const c2pIframe = '.js-c2p-payment-iframe-container';
    const click2PayPaymentData = '.js-c2p-payment-data';

    function handleCheckoutWithC2P(c2pInstance, srcDigitalCardId){
        return checkoutWithExistingCard(c2pInstance, srcDigitalCardId);
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
        //Click2PayLogger.logInfo("initiating checkoutWithCard()");
        //Click2PayLogger.logResponse("checkoutWithCard", {}, c2pInstance);
        openIframe();
        const checkoutPromise = c2pInstance.checkoutWithCard(params);
        return checkoutPromise
            .then(response => checkoutWithCardSuccessHandler(response, c2pInstance))
            .catch(error => checkoutWithCardFailedHandler(error))
    }

    function checkoutWithCardSuccessHandler(response, c2pInstance){
        console.log("checkoutWithCard() SUCCESS");
        //Click2PayLogger.logResponse("checkoutWithCard", response, c2pInstance);
        if (response.checkoutActionCode === 'COMPLETE') {
            /*const placeOrderWithC2PEmbeddedURL = checkoutClick2payUtil.getPlaceOrderURL(response);
            window.location.href = placeOrderWithC2PEmbeddedURL;*/
        } else if(response.checkoutActionCode === 'SWITCH_CONSUMER'){
            closeIFrame();
            //checkoutClick2payUtil.closeiFrame();
            //checkoutC2PSignOut.handleSignout(c2pInstance);
        } else{
            closeIFrame();
            if(response.network.toUpperCase() === 'VISA'){ //work around Mastercard suggested for when shopper cancels
                // using visa for c2p (reload payment page)
                //Click2PayLogger.logInfo("checkoutWithCard() INCOMPLETE VISA");
                //spinner.showSpinner();
                //window.location.href = window.location.href;
            }
        }
        return new Promise((resolve) => {
            resolve(response);
        })
    }

    function checkoutWithCardFailedHandler(error){
        console.log("checkoutWithCard() ERROR");
        const errorMessage = error.message;
        //Click2PayLogger.logInfo("checkoutWithNewCard failed message: " + errorMessage);
        //checkoutClick2payUtil.displayErrorMessage(stringReplacer.getMessage("checkout.click_to_pay.place_order.error"));
        //checkoutClick2payUtil.closeiFrame();
        closeIFrame();
    }

    function openIframe(){
        const iFrameContainer = document.querySelector(c2pIframe);
        if(iFrameContainer){
            iFrameContainer.style.display = "block";
        }
    }

    function closeIFrame(){
        const iFrameContainer = document.querySelector(c2pIframe);
        if(iFrameContainer){
            iFrameContainer.style.display = "none";
        }
    }

    function getDigitalCardId(){
        const paymentData = document.querySelector(click2PayPaymentData);
        if(paymentData){
            return paymentData.getAttribute(CUSTOM_ATTR_SELECTED_CARD);
        } else {
            return "";
        }
    }

    return {
        handleCheckoutWithC2P,
        getDigitalCardId,
        openIframe,
        closeIFrame
    }
})();

export default Click2PayPlaceOrder;