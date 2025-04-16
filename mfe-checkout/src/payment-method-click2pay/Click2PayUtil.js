/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayUtil = (function () {
    const checkoutSpinner = document.querySelector('.js-mfe-checkout-placeholder');

    function getC2pData() {
        const c2pData = localStorage.getItem('c2pData');
        if (c2pData) {
            return JSON.parse(c2pData);
        } else {
            return {};
        }
    }

    function showSpinner(show){
        if(checkoutSpinner){
            checkoutSpinner.style.display = show ? "block" : "none";
        }
    }

    return {
        getC2pData,
        showSpinner
    }
})();

export default Click2PayUtil;