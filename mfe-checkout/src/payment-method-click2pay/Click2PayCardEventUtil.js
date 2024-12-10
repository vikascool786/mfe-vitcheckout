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

    return {
        triggerClick2PaySelectedCardEvent
    }
})();

export default Click2PayEventUtil;