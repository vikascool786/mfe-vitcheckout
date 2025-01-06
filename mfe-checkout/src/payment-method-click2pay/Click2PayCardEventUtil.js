/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

const Click2PayEventUtil = (function(){
    const paymentOptionContainer = '.payment-option-container';

    function triggerClick2PaySelectedCardEvent(){
        const paymentOption = document.querySelector(paymentOptionContainer);
        if (paymentOption) {
            const event = new CustomEvent('c2pSelectedCard');
            document.dispatchEvent(event);
        }
    }

    function triggerClick2PayErrorEvent(errorMessage){
        const event = new CustomEvent("c2pError", {
            detail: { message: errorMessage },
        });
        document.dispatchEvent(event);
    }

    return {
        triggerClick2PaySelectedCardEvent,
        triggerClick2PayErrorEvent
    }
})();

export default Click2PayEventUtil;