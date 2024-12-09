/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

const Click2PayEventUtil = (function(){
    const paymentOptionContainer = '.payment-option-container';

    function deselectAllPayments(){
        const paymentOption = document.querySelector(paymentOptionContainer);
        if (paymentOption) {
            const event = new CustomEvent('deselectPaymentMethods');
            document.dispatchEvent(event);
        }
    }

    return {
        deselectAllPayments
    }
})();

export default Click2PayEventUtil;