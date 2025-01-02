/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */
import Click2PayLogger from "./Click2PayLogger";
import Click2PayCardLoader from "./Click2PayCardLoader";
import Click2PayElementUtil from "./Click2PayElementUtil";
const srcOtpInput = "src-otp-input";
const srcOtpSelection = "src-otp-channel-selection";
const CUSTOM_ATTRIBUTE_EVENT_LISTENER = "data-has-event-listener";
const CUSTOM_ATTR_OTP_CHANNEL_ID = "data-otp-channel-id";
const otpInputContainerClass = '.js-c2p-otp-container';
const otpSelectionContainerClass = '.js-c2p-otp-selection-container';
const emptyCardsContainer = '.js-c2p-empty-card-list-msg';

export const initiateValidation = (c2pInstance, selectedChannel) => {
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
        });
        otpInput.addEventListener('continue', (e) => {
            disableOTPInput();
            const otpValue = otpInput.getAttribute("data-otp-value");
            validateOTP(c2pInstance, otpValue);
        });
        otpInput.addEventListener('otpChanged', (event) => {
            otpInput.setAttribute("data-otp-value", event.detail);
        });
        otpInput.addEventListener('close', () => {
            closeOTPModal();
        });
    }
}

function configureOTPChannelSelections(channelList){
    const otpChannelSelection = document.querySelector(otpSelectionContainerClass);
    otpChannelSelection.innerHTML = `<src-otp-channel-selection type="overlay" display-cancel-option="true" style="display: none"></src-otp-channel-selection>`;
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
            closeOTPSelectionScreen();
            closeOTPModal();
        });
        srcOtpChannelSelection.addEventListener('continue', () => {
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
    console.error("error: " + error.message);
    //Click2PayLogger.logInfo("initiateValidation() failed error: " + error.message);
    updateOTPErrorReason(error.reason);
    enableOTPInput();
}

function updateOTPErrorReason(error){
    const otpInput = document.querySelector(srcOtpInput);
    otpInput.setAttribute("error-reason", error);
}

function enableOTPInput(){
    const otpInput = document.querySelector(srcOtpInput);
    otpInput.setAttribute("disable-elements", "false");
}

function handleOTPResponse(cardList, c2pInstance){
    if(cardList.length){
        Click2PayCardLoader.loadSRCCardsOnPage(cardList, c2pInstance, true, false, false);
        //checkoutPaymentMethods.hideAllPaymentMethods();
    } else{
        //Click2PayLogger.logInfo("Click2pay cardlist returned empty");
        Click2PayCardLoader.hideAccessCardsMessage();
        showEmptyCardListMsg();
        Click2PayElementUtil.showCardListAddNewC2PCard();
    }
}

function showEmptyCardListMsg(){
    const emptyCardsMsg = document.querySelector(emptyCardsContainer);
    if(emptyCardsMsg){
        emptyCardsMsg.style.display = "block";
    }
}