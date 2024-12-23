/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
import Click2PayUtil from "./Click2PayUtil";
import Click2PayPlaceOrder from "./Click2PayPlaceOrder";
const Click2PayNewCard = (function () {
    const addCardOverlay = '.js-c2p-payment-add-card-container';
    const errorContainer = '.js-c2p-payment-add-card-error-container';
    const cardForm = '.js-c2p-payment-add-card-form';

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
        encryptPromise
            .then(response => encryptCardSuccessHandler(response, c2pInstance))
            .catch(error => encryptCardFailedHandler(error))
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

    function encryptCardSuccessHandler(response, c2pInstance){
        //Click2PayLogger.logResponse("encryptCard", response, c2pInstance);
        closeAddCardOverlay();
        Click2PayPlaceOrder.openIframe();
        checkoutWithNewCard(c2pInstance, response);
        //checkoutClick2payUtil.openiFrame();
        ////checkoutC2PAddCard.checkoutWithNewCard(c2pInstance, response);
    }

    function encryptCardFailedHandler(error){
        const errorMessage = error.message;
        //Click2PayLogger.logInfo("encryptCard failed message: " + errorMessage);
        const encryptErrMsg = "There has been a problem adding your a new card to your Click to Pay wallet. Please enter a different payment method or try again.";
        displayError(encryptErrMsg);
        //cancelNewCardOverlay();
        //checkoutClick2payUtil.displayErrorMessage(stringReplacer.getMessage("checkout.click_to_pay.encrypt_new_card.error"));
    }

    function displayError(errorMessage){
        const errorDiv = document.querySelector(errorContainer);
        errorDiv.innerHTML = errorMessage;
        errorDiv.style.display = "block";
        hideCreditCardForm()
    }

    function hideCreditCardForm(){
        const form = document.querySelector(cardForm);
        if(form){
            form.style.display = "none";
        }
    }

    function checkoutWithNewCard(c2pInstance, encryptedCardData){
        //checkoutClick2payUtil.hideErrorMessage();
        const params = buildNewCardParameters(encryptedCardData);
        //Click2PayLogger.logInfo("initiating checkoutWithNewCard()");
        //Click2PayLogger.logResponse("checkoutWithNewCard", {}, c2pInstance);
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
        //Click2PayLogger.logResponse("checkoutWithNewCard", response, c2pInstance);
        console.log("checkout with new card success: " + JSON.stringify(response));
        if (response.checkoutActionCode === 'COMPLETE') {
            /*const placeOrderWithC2PEmbeddedURL = checkoutClick2payUtil.getPlaceOrderURL(response);
            c2pData.checkoutUrl = placeOrderWithC2PEmbeddedURL;
            checkoutClick2payUtil.closeiFrame();
            setNewCardPlaceOrderCustomAttribute(c2pInstance);*/
            displayNewCard(response);

        }else if(response.checkoutActionCode === 'CHANGE_CARD'){
            Click2PayPlaceOrder.closeIFrame();
            //checkoutClick2payUtil.closeiFrame();
            //checkoutC2PCards.getCards(c2pInstance); //need to refresh the card list since new card was added
        } else{
            Click2PayPlaceOrder.closeIFrame();
        }
    }

    function displayNewCard(response) {
        console.log("display new card");
        const cardData = response.checkoutResponseData.maskedCard;
        const digitalCardData = cardData.digitalCardData;
        const singleCardElement = document.createElement("src-card");
        if (cardData.panBin) {
            singleCardElement.setAttribute("account-bin", cardData.panBin);
        }
        singleCardElement.setAttribute("account-number-suffix", cardData.panLastFour);
        singleCardElement.setAttribute("card-art", digitalCardData.artUri);
        singleCardElement.setAttribute("descriptor-name", digitalCardData.descriptorName);
        singleCardElement.setAttribute("card-status", digitalCardData.status);
        singleCardElement.setAttribute("locale", "en_US");
        /*singleCardContainer.replaceChildren(singleCardElement);
        elementDisplayUtil.setElementVisibility(singleCardContainer, "block");
        elementDisplayUtil.setElementVisibility(c2pEmbeddedPayment, "block");
        elementDisplayUtil.setElementVisibility(srcCardList, "none");
        hideAddNewCard();
        checkoutClick2payUtil.hideEmptyCardListMsg();
        checkoutClick2payUtil.showChangePaymentMethod();
        hideCardListAddNewC2PCard();
        checkoutPaymentMethods.hideAllPaymentMethods();
        checkoutPaymentUtil.enableC2PPlaceOrderButton();
        checkoutClick2payUtil.triggerC2PSelectionChange(C2P_TYPE_ID, cardData.panBin, cardData.panLastFour);*/
    }

    function checkoutWithNewCardFailedHandler(error){
        const errorMessage = error.message;
        console.log("checkoutWithNewCard() failed error message: " + errorMessage, JSON.stringify(error));
        //Click2PayLogger.logInfo("checkoutWithNewCard failed message: " + errorMessage);
        Click2PayPlaceOrder.closeIFrame();
        //checkoutClick2payUtil.displayErrorMessage(stringReplacer.getMessage("checkout.click_to_pay.new_payment.error"));
    }

    return {
        openAddCardOverlay,
        closeAddCardOverlay,
        addCardToClick2Pay
    }
})();

export default Click2PayNewCard;