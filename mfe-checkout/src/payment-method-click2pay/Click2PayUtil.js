/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayUtil = (function () {

    function getC2pData() {
        const c2pData = localStorage.getItem('c2pData');
        if (c2pData) {
            return JSON.parse(c2pData);
        } else {
            return {};
        }
    }

    return {
        getC2pData
    }
})();

export default Click2PayUtil;