/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayLogger from "./Click2PayLogger";
import Click2PayUtil from "./Click2PayUtil";
const Click2PayCards = (function () {

    function getUserCards(c2pInstance) {
        return c2pInstance.getCards()
            .then((cardsResponse) => {
                console.log("getCards response: " + JSON.stringify(cardsResponse));
                return new Promise((resolve) => {
                    if (cardsResponse.length < 1) {
                        resolve(doLookup(c2pInstance));
                    } else {
                        resolve(cardsResponse);
                    }
                });
            });
    }

    function doLookup(c2pInstance) {
        return new Promise((resolve) => {
            resolve(lookupUserAccount(c2pInstance));
        });

    }

    function lookupUserAccount(c2pInstance) {
        if (hasMobilePhone()) {
            return lookupAccountByMobile(c2pInstance, true);
        } else {
            return lookupAccountByEmail(c2pInstance, false);
        }
    }

    function lookupAccountByMobile(c2pInstance) {
        const params = {
            mobileNumber: {
                countryCode: "1",
                phoneNumber: Click2PayUtil.getC2pData().mobilePhone
            }
        }
        console.log("looking up by mobile");
        return lookupAccount(c2pInstance, params, true);
    }

    function lookupAccountByEmail(c2pInstance) {
        const params = {
            email: `${Click2PayUtil.getC2pData().email}`
        }
        console.log("looking up by email");
        return lookupAccount(c2pInstance, params, false);
    }

    function lookupAccount(c2pInstance, params, isMobileLookup) {
        return c2pInstance.idLookup(params)
            .then((lookupResponse) => {
                console.log("lookup response: " + JSON.stringify(lookupResponse));
                return new Promise((resolve) => {
                    if (lookupResponse.consumerPresent === true) {
                        resolve(lookupResponse);
                    } else {
                        if (isMobileLookup) {
                            //try email if mobile does not return true
                            resolve(lookupAccountByEmail(c2pInstance, params, false));
                        } else {
                            resolve(lookupResponse);
                        }
                    }
                });
            });
    }

    function hasMobilePhone() {
        return Click2PayUtil.getC2pData().mobilePhone;
    }

    return {
        getUserCards
    }
})();

export default Click2PayCards;