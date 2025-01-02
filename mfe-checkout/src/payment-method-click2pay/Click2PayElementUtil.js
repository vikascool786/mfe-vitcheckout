/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

const Click2PayElementUtil = (function(){
    const addNewClick2PayCard = '.js-c2p-add-new-card';

    function toggleCardListAddNewC2PCard(show){
        const addNew = document.querySelector(addNewClick2PayCard);
        if(addNew){
            addNew.style.display = show ? "flex" : "none";
        }
    }

    function showCardListAddNewC2PCard(){
        toggleCardListAddNewC2PCard(true);
    }

    function hideCardListAddNewC2PCard(){
        toggleCardListAddNewC2PCard(false);
    }

    return {
        showCardListAddNewC2PCard,
        hideCardListAddNewC2PCard,
    }
})();

export default Click2PayElementUtil;