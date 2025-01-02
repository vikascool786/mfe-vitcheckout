/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
import Click2PayEventUtil from "./Click2PayCardEventUtil";
import Click2PayElementUtil from "./Click2PayElementUtil";
import Click2PaySignOut from "./Click2PaySignOut";
const Click2PayCardLoader = (function(){
    let clickToPayCardList;
    const CUSTOM_ATTR_SELECTED_CARD = "data-selected-card";
    const existingC2PContainer = '.js-c2p-existing-user';
    const srcCardListElement = 'src-card-list';
    const click2PayPaymentData = '.js-c2p-payment-data';
    const accessCardsContainer = '.js-c2p-access-cards-msg';

    function loadSRCCardsOnPage(cardList, c2pInstance, showAddNewCard, deselectCard, showSignout){
        const srcCardList = document.querySelector(existingC2PContainer).querySelector(srcCardListElement);
        clickToPayCardList = Array(cardList);
        srcCardList.loadCards(cardList);
        if(deselectCard){
            //checkoutClick2payUtil.deselectC2PCard();
        }
        if(showSignout){
            srcCardList.setAttribute("display-sign-out", "true");
        }
        if(showAddNewCard){
            Click2PayElementUtil.showCardListAddNewC2PCard();
        }
        hideAccessCardsMessage();
        Click2PayEventUtil.triggerClick2PaySelectedCardEvent();
        addCardListEventListeners(c2pInstance);
    }

    function addCardListEventListeners(c2pInstance) {
        const srcCardList = document.querySelector(existingC2PContainer).querySelector(srcCardListElement);
        const paymentData = document.querySelector(click2PayPaymentData);
        if(srcCardList){
            srcCardList.addEventListener('clickSignOutLink', event => {
                Click2PaySignOut.handleSignout(c2pInstance);
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

    function hideAccessCardsMessage(){
        const accessCards = document.querySelector(accessCardsContainer);
        if(accessCards){
            accessCards.style.display = "none";
        }
    }

    return {
        loadSRCCardsOnPage,
        hideAccessCardsMessage
    }
})();

export default Click2PayCardLoader;