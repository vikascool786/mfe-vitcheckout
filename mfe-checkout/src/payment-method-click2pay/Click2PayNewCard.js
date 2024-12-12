/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
import Click2PayUtil from "./Click2PayUtil";
const Click2PayNewCard = (function () {
    const addCardOverlay = '.js-c2p-payment-add-card-container';

    function closeAddCardOverlay() {
        toggleNewCardOverlay(false);
    }

    function openAddCardOverlay() {
        toggleNewCardOverlay(true);
    }

    function toggleNewCardOverlay(showOverlay){
        const overlay = document.querySelector(addCardOverlay);
        if(overlay){
            overlay.style.display = showOverlay ? "block" : "none";
        }
    }

    function addCardToClick2Pay(c2pInstance){
        //Click2PayLogger.logInfo("click2pay save new card clicked");
        encryptCard(c2pInstance);

        //event.preventDefault();
        /*if(newCardForm.checkValidity()){
            const parsleyConfig = configParsleyOptions();
            $(newCardForm).parsley(parsleyConfig).validate();
            if($(newCardForm).parsley().isValid()){
                encryptCard(c2pInstance);
            }
        }*/
    }

    function encryptCard(c2pInstance){
        //c2pData.mobilePhone = newCardPaymentInfo.mobilePhone.value;
        const params = buildEncryptCardParams();
        //Click2PayLogger.logInfo("initiating encryptCard()");
        //Click2PayLogger.logResponse("encryptCard", {}, c2pInstance);
        const encryptPromise = c2pInstance.encryptCard(params);
        /*encryptPromise
            .then(response => encryptCardSuccessHandler(response, c2pInstance))
            .catch(error => encryptCardFailedHandler(error))*/
    }

    function buildEncryptCardParams(){
        //Click2PayLogger.logInfo("click2pay building encrypt card parameters");
        const addCardForm = document.querySelector('.js-c2p-payment-add-card-form');
        const formData = new FormData(addCardForm);
        const data = Object.fromEntries(formData.entries());
        const parameters = {
            primaryAccountNumber: data.number,
            panExpirationMonth: data.month,
            panExpirationYear: data.year.substring(2),
            cardSecurityCode: data.cvv,
            cardholderFirstName: `${Click2PayUtil.getC2pData().address.first}`,
            cardholderLastName: `${Click2PayUtil.getC2pData().address.last}`
        }
        /*let expMonth = newCardPaymentInfo.cardExpMonth.value.length < 2 ?
            "0".concat(newCardPaymentInfo.cardExpMonth.value) : newCardPaymentInfo.cardExpMonth.value;
        const parameters = {
            primaryAccountNumber: newCardPaymentInfo.cardNumber.value,
            panExpirationMonth: expMonth,
            panExpirationYear: newCardPaymentInfo.cardExpYear.value.substr(2),
            cardSecurityCode: newCardPaymentInfo.cardCvv.value,
            cardholderFirstName: `${c2pData.address.first}`,
            cardholderLastName: `${c2pData.address.last}`
        }*/
        /*if(hasBillingAddress()){
            parameters.billingAddress = getBillingAddress();
        }*/
        return parameters;
    }

    return {
        openAddCardOverlay,
        closeAddCardOverlay,
        addCardToClick2Pay
    }
})();

export default Click2PayNewCard;