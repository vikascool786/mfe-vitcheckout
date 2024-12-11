/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
const Click2PayCardLoader = (function(){
    let clickToPayCardList;
    const CUSTOM_ATTR_SELECTED_CARD = "data-selected-card";
    const srcCardListElement = 'src-card-list';
    const addNewClick2PayCard = '.js-c2p-add-new-card';
    const click2PayPaymentData = '.js-c2p-payment-data';

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
        addCardListEventListeners(c2pInstance);
    }

    function addCardListEventListeners(c2pInstance) {
        const srcCardList = document.querySelector(srcCardListElement);
        const paymentData = document.querySelector(click2PayPaymentData);
        if(srcCardList){
            srcCardList.addEventListener('clickSignOutLink', event => {
                //checkoutC2PSignOut.handleSignout(c2pInstance);
            });
            srcCardList.addEventListener('selectSrcDigitalCardId', event => {
                const selectedCardId = event.detail;
                paymentData.setAttribute(CUSTOM_ATTR_SELECTED_CARD, selectedCardId);
                //placeOrderButton.setAttribute(CUSTOM_ATTR_SELECTED_CARD, event.detail);
                //checkoutPaymentMethods.deselectAllExistingShopperCreditCards();
                //checkoutPaymentMethods.deselectAllInstallmentPaymentOptions();
                //checkoutPaymentUtil.enableC2PPlaceOrderButton();
                //validatorUtils.hideValidationMessages();
                //triggerSelectionChange(selectedCardId);
            });
        }
    }

    function showCardListAddNewC2PCard(){
        const addNew = document.querySelector(addNewClick2PayCard);
        if(addNew){
            addNew.style.display = "flex";
        }
    }

    return {
        loadSRCCardsOnPage,
        showCardListAddNewC2PCard
    }
})();

export default Click2PayCardLoader;