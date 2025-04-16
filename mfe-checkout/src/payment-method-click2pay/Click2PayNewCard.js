/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
import Click2PayUtil from "./Click2PayUtil";
import Click2PayPlaceOrder from "./Click2PayPlaceOrder";
import Click2PayEventUtil from "./Click2PayCardEventUtil";
import Click2PayCards from "./Click2PayCards";
import Click2PayCardLoader from "./Click2PayCardLoader";
const Click2PayNewCard = (function () {
    const addCardOverlay = '.js-c2p-payment-add-card-container';

    function closeAddCardOverlay() {
        toggleNewCardOverlay(false);
    }

    function openAddCardOverlay() {
        toggleNewCardOverlay(true);
        const overlay = document.querySelector(addCardOverlay);
        overlay.querySelector("button").focus();
    }

    function toggleNewCardOverlay(showOverlay){
        const overlay = document.querySelector(addCardOverlay);
        if(overlay){
            overlay.style.display = showOverlay ? "inline-flex" : "none";
        }
    }

    function addCardToClick2Pay(c2pInstance, values){
        Click2PayLogger.logInfo("click2pay save new card clicked");
        encryptCard(c2pInstance, values);
    }

    function encryptCard(c2pInstance, values){
        //c2pData.mobilePhone = newCardPaymentInfo.mobilePhone.value;
        const params = buildEncryptCardParams(values);
        Click2PayLogger.logInfo("initiating encryptCard()");
        Click2PayLogger.logResponse("encryptCard", {}, c2pInstance);
        const encryptPromise = c2pInstance.encryptCard(params);
        encryptPromise
            .then(response => encryptCardSuccessHandler(response, c2pInstance))
            .catch(error => encryptCardFailedHandler(error))
    }

    function buildEncryptCardParams(values){
        Click2PayLogger.logInfo("click2pay building encrypt card parameters");
        const parameters = {
            primaryAccountNumber: values.cardInfo.number,
            panExpirationMonth: values.cardInfo.expMonth,
            panExpirationYear: values.cardInfo.expYear.substring(2),
            cardSecurityCode: values.cardInfo.cvv,
            cardholderFirstName: values.cardInfo.accountName,
            cardholderLastName: ""
        }
        /*if(hasBillingAddress()){
            parameters.billingAddress = getBillingAddress();
        }*/
        return parameters;
    }

    function encryptCardSuccessHandler(response, c2pInstance){
        Click2PayLogger.logResponse("encryptCard", response, c2pInstance);
        closeAddCardOverlay();
        Click2PayPlaceOrder.openIframe();
        checkoutWithNewCard(c2pInstance, response);
    }

    function encryptCardFailedHandler(error){
        const errorMessage = error.message;
        Click2PayLogger.logInfo("encryptCard failed message: " + errorMessage);
        const encryptErrMsg = "There has been a problem adding your a new card to your Click to Pay wallet. Please enter a different payment method or try again.";
        Click2PayEventUtil.triggerClick2PayErrorEvent(encryptErrMsg);
        closeAddCardOverlay();
    }

    function checkoutWithNewCard(c2pInstance, encryptedCardData){
        //checkoutClick2payUtil.hideErrorMessage();
        const params = buildNewCardParameters(encryptedCardData);
        Click2PayLogger.logInfo("initiating checkoutWithNewCard()");
        Click2PayLogger.logResponse("checkoutWithNewCard", {}, c2pInstance);
        const checkoutPromise = c2pInstance.checkoutWithNewCard(params);
        checkoutPromise
            .then(response => checkoutWithNewCardSuccessHandler(response, c2pInstance))
            .catch(error => checkoutWithNewCardFailedHandler(error))
    }

    function buildNewCardParameters(encryptedCardData){
        let params = {
            encryptedCard: encryptedCardData.encryptedCard,
            cardBrand: encryptedCardData.cardBrand,
            consumer: {
                emailAddress: `${Click2PayUtil.getC2pData().email}`,
                firstName: `${Click2PayUtil.getC2pData().address.first}`,
                lastName: `${Click2PayUtil.getC2pData().address.last}`
            },
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
        /*if(checkoutC2PCards.hasMobilePhone()){
            const mobilePhone = {
                phoneNumber: getFilteredPhoneNumber(c2pData.mobilePhone),
                countryCode: "1"
            }
            params.consumer.mobileNumber = mobilePhone;
        }*/
        return params;
    }

    function checkoutWithNewCardSuccessHandler(response, c2pInstance){
        Click2PayLogger.logResponse("checkoutWithNewCard", response, c2pInstance);
        console.log("checkout with new card success: " + JSON.stringify(response));
        if (response.checkoutActionCode === 'COMPLETE') {
            Click2PayPlaceOrder.closeIFrame();
            refreshCardList(c2pInstance);
        }else if(response.checkoutActionCode === 'CHANGE_CARD'){
            Click2PayPlaceOrder.closeIFrame();
            refreshCardList(c2pInstance);
        } else{
            Click2PayPlaceOrder.closeIFrame();
        }
    }

    function refreshCardList(c2pInstance){
        Click2PayUtil.showSpinner(true);
        const cardsPromise = Click2PayCards.getUserCards(c2pInstance);
        cardsPromise.then(cardsResponse => {
            Click2PayCardLoader.loadSRCCardsOnPage(cardsResponse, window.c2pInstance, true, false, false)
            Click2PayUtil.showSpinner(false);
            }
        ).catch(error => {
            Click2PayUtil.showSpinner(false);
            Click2PayLogger.logInfo("getUserCards() failed message on card refresh: " + error);
        })
    }

    function checkoutWithNewCardFailedHandler(error){
        const errorMessage = error.message;
        console.error("checkoutWithNewCard() failed error message: " + errorMessage, JSON.stringify(error));
        Click2PayLogger.logInfo("checkoutWithNewCard failed message: " + errorMessage);
        Click2PayPlaceOrder.closeIFrame();
        const failedMessage = "There has been a problem adding your a new card to your Click to Pay wallet. Please try again.";
        Click2PayEventUtil.triggerClick2PayErrorEvent(failedMessage);
    }

    return {
        openAddCardOverlay,
        closeAddCardOverlay,
        addCardToClick2Pay
    }
})();

export default Click2PayNewCard;