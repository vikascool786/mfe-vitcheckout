/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */
import Click2PayLogger from "./Click2PayLogger";
import Click2PayEventUtil from "./Click2PayCardEventUtil";
import Click2PayCardLoader from "./Click2PayCardLoader";
const srcOtpInput = "src-otp-input";
const srcOtpSelection = "src-otp-channel-selection";
const CUSTOM_ATTRIBUTE_EVENT_LISTENER = "data-has-event-listener";
const CUSTOM_ATTR_OTP_CHANNEL_ID = "data-otp-channel-id";
const otpInputContainerClass = '.js-c2p-otp-container';
const otpSelectionContainerClass = '.js-c2p-otp-selection-container';
const accessCardsContainer = '.js-c2p-access-cards-msg';

export const initiateValidation = (c2pInstance, selectedChannel) => {
    console.log("initiate validation");
    let initiateValidationPromise;
    if(selectedChannel){
        const params = {
            requestedValidationChannelId: selectedChannel
        }
        initiateValidationPromise = c2pInstance.initiateValidation(params);
    } else{
        initiateValidationPromise = c2pInstance.initiateValidation();
    }
    return initiateValidationPromise
        .then(response => {
            console.log("initiateValidation response: " + JSON.stringify(response));
            const otpInputContainer = document.querySelector(otpInputContainerClass);
            if(otpInputContainer){
                const otpInput = otpInputContainer.querySelector(srcOtpInput);
                otpInput.loadSupportedValidationChannels(response.supportedValidationChannels);
                otpInput.setAttribute("masked-identity-value", response.maskedValidationChannel);
                otpInput.setAttribute("network-id", response.network);
                otpInputContainer.style.display = "block";
                configureOTPChannelSelections(response.supportedValidationChannels);
                addOtpChannelSelectionEventListeners(c2pInstance);
                addOtpModalEventListeners(c2pInstance, hasEventListenerForOtpModal());
            }
        })
        .catch(error => {
            //Click2PayLogger.logInfo("initiateValidation() failed error: " + error.message);
            console.log("error: " + error.message);
        })
};

function addOtpModalEventListeners(c2pInstance, hasListener) {
    const otpInput = document.querySelector(srcOtpInput);
    if(otpInput && !hasListener){
        otpInput.setAttribute(CUSTOM_ATTRIBUTE_EVENT_LISTENER, "true");
        otpInput.addEventListener('alternateRequested', () => {
            showOTPSelectionScreen();
            console.log("alternate requested");
        });
        otpInput.addEventListener('continue', (e) => {
            disableOTPInput();
            const otpValue = otpInput.getAttribute("data-otp-value");
            validateOTP(c2pInstance, otpValue);
            console.log("continue");
        });
        otpInput.addEventListener('otpChanged', (event) => {
            otpInput.setAttribute("data-otp-value", event.detail);
            console.log("otp changed");
        });
        otpInput.addEventListener('close', () => {
            closeOTPModal();
        });
    }
}

function configureOTPChannelSelections(channelList){
    const srcOtpChannelSelection = document.querySelector(srcOtpSelection);
    srcOtpChannelSelection.identityValidationChannels = channelList;
}

function addOtpChannelSelectionEventListeners(c2pInstance) {
    const srcOtpChannelSelection = document.querySelector(srcOtpSelection);
    const otpChannelSelection = document.querySelector(otpSelectionContainerClass);

    if(srcOtpChannelSelection){
        srcOtpChannelSelection.addEventListener('selectChannel', event => {
            if(event.detail.validationChannelId) {
                otpChannelSelection.setAttribute(CUSTOM_ATTR_OTP_CHANNEL_ID, event.detail.validationChannelId);
            } else{
                otpChannelSelection.setAttribute(CUSTOM_ATTR_OTP_CHANNEL_ID, "");
            }
        });
        srcOtpChannelSelection.addEventListener('close', () => {
            console.log("otp select close");
            closeOTPSelectionScreen();
            closeOTPModal();
        });
        srcOtpChannelSelection.addEventListener('continue', () => {
            console.log("otp select continue");
            closeOTPSelectionScreen();
            const selectedChannel = otpChannelSelection.getAttribute(CUSTOM_ATTR_OTP_CHANNEL_ID);
            if(selectedChannel){
                initiateValidation(c2pInstance, selectedChannel);
            } else{
                closeOTPModal();
            }
        });
    }
}

function hasEventListenerForOtpModal(){
    const otpInput = document.querySelector(srcOtpInput);
    if(otpInput){
        return otpInput.hasAttribute(CUSTOM_ATTRIBUTE_EVENT_LISTENER);
    } else{
        return false;
    }
}

function closeOTPModal(){
    const otpInputContainer = document.querySelector(otpInputContainerClass);
    if(otpInputContainer){
        otpInputContainer.style.display = "none";
    }
}

function showOTPSelectionScreen(){
    const otpSelectionContainer = document.querySelector(otpSelectionContainerClass);
    const srcOtpChannelSelection = document.querySelector(srcOtpSelection);
    if(otpSelectionContainer){
        otpSelectionContainer.style.display = "block";
        srcOtpChannelSelection.style.display = "block";
    }
}

function closeOTPSelectionScreen(){
    const otpChannelSelection = document.querySelector(srcOtpSelection);
    if(otpChannelSelection){
        otpChannelSelection.style.display = "none";
    }
}

function disableOTPInput(){
    const otpInput = document.querySelector(srcOtpInput);
    otpInput.setAttribute("disable-elements", "true");
}

function validateOTP(c2pInstance, otpCode){
    const params = {
        value: otpCode
    }
    const validatePromise = c2pInstance.validate(params);
    validatePromise
        .then(response => validateOTPSuccessHandler(response, c2pInstance))
        .catch(error => validateOTPFailedHandler(error))
}

function validateOTPSuccessHandler(response, c2pInstance){
    closeOTPModal();
    handleOTPResponse(response, c2pInstance);
}

function validateOTPFailedHandler(error){
    console.log("error: " + error.message);
    //Click2PayLogger.logInfo("initiateValidation() failed error: " + error.message);
    //updateOTPErrorReason(error.reason);
    //enableOTPInput();
}

function handleOTPResponse(cardList, c2pInstance){
    if(cardList.length){
        Click2PayCardLoader.loadSRCCardsOnPage(cardList, c2pInstance, false, false, false);
        hideAccessCardsMessage();
        Click2PayEventUtil.deselectAllPayments();
        //checkoutPaymentMethods.hideAllPaymentMethods();
    } else{
        //debug.log("Mastercard click2pay embedded cardlist returned empty");
        //hideAccessCardsMessage();
        //checkoutClick2payUtil.showEmptyCardListMsg();
        //checkoutC2PCardLoader.showCardListAddNewC2PCard();
    }
}

function hideAccessCardsMessage(){
    const accessCards = document.querySelector(accessCardsContainer);
    if(accessCards){
        accessCards.style.display = "none";
    }
}