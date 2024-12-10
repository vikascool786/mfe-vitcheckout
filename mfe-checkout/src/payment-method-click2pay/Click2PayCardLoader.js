/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayCardLoader = (function(){
    let clickToPayCardList;
    const srcCardListElement = 'src-card-list';
    const addNewClick2PayCard = '.js-c2p-add-new-card';

    function loadSRCCardsOnPage(cardList, c2pInstance, showAddNewCard, deselectCard, showSignout){
        const srcCardList = document.querySelector(srcCardListElement);
        clickToPayCardList = Array(cardList);
        srcCardList.loadCards(cardList);
        /*if(deselectCard){
            checkoutClick2payUtil.deselectC2PCard();
        }*/
        /*if(showSignout){
            srcCardList.setAttribute("display-sign-out", "true");
        }*/
        if(showAddNewCard){
            showCardListAddNewC2PCard();
        }
        /*addCardListEventListeners(c2pInstance);
        checkoutC2PPlaceOrder.addPlaceOrderEventListener(c2pInstance);*/
    }

    function showCardListAddNewC2PCard(){
        const addNew = document.querySelector(addNewClick2PayCard);
        if(addNew){
            addNew.style.display = "flex";
        }
    }

    return {
        loadSRCCardsOnPage
    }
})();

export default Click2PayCardLoader;