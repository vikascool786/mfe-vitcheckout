import React, { useEffect, useState } from "react";
import { GET_CLICK2PAY_DPA_ID } from "../utils/ApiConstants";
import Click2PayInitializer from "./Click2PayInitializer";
import Click2PayCards from "./Click2PayCards";
import Click2PayNewCard from "./Click2PayNewCard";
import { initiateValidation } from "./Click2PayOTP";
import "./PaymentOptionClick2Pay.scss";
import { Add } from "../assets/icons/Add";
import { Warn } from "../assets/icons/Warn";
import { CardInformation } from "../payment-method/card-information/CardInformation";
import { ShopperSavedPayments } from "../interfaces/ShopperSavedPayments";
import { Button } from "../component/Button/Button";

export const PaymentOptionClick2Pay: React.FC = ({ }) => {
    const [hasSavedCards, setHasSavedCards] = useState(false);

    /*TODO: need to pass c2pdata in dynamically*/
    const c2pData = {
        mcc: "5963",
        //email: "staging_c2p_0307@yopmail.com",
        //email: "test_dev_0716@yopmail.com", //no saved c2p cards
        email: "dev_new_0216@yopmail.com",
        transactionAmount: 38.95,
        hasAutoship: false,
        mobilePhone: "",
        cardBrands: ["mastercard", "visa", "discover", "amex"],
        address: {
            first: "test",
            last: "test",
            address1: "1 lower ragsdale dr",
            address2: "",
            address3: "",
            city: "monterey",
            state: "CA",
            zip: "93940"
        },
        hasInstallmentsEnabled: false,
        hasEmbeddedC2PEnabled: true
    }

    const cardBrandsString = c2pData.cardBrands.join(",");
    const shopperSavedPayment: ShopperSavedPayments = { //used to prefill address for new c2p card
        id: 0,
        image: "",
        expirationDate: "",
        cardMask: "",
        preferred: false,
        type: 0,
        address: c2pData.address,
        accountName: ""
    }

    useEffect(() => {
        localStorage.setItem('c2pData', JSON.stringify(c2pData));
    }, []);

    useEffect(() => {
        const waitForC2PLibrary = () => {
            return new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    // @ts-ignore
                    if (window.Click2Pay) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        };

        waitForC2PLibrary().then(() => {
            initializeClick2Pay();
        });

        const initParams = {
            srcDpaId: `${GET_CLICK2PAY_DPA_ID}`,
            dpaTransactionOptions: {
                "dpaLocale": "en_US",
                "transactionAmount": {
                    "transactionAmount": Number(c2pData.transactionAmount.toFixed(2)),
                    "transactionCurrencyCode": "USD"
                },
                "merchantCategoryCode": `${c2pData.mcc}`,
                "merchantCountryCode": "US",
                "dpaBillingPreference": "FULL",
                "consumerNameRequested": true,
                "confirmPayment": false,
                "paymentOptions": [
                    {
                        "dynamicDataType": "NONE"
                    }
                ]
            },
            services: ["INLINE_CHECKOUT"],
            checkoutExperience: "WITHIN_CHECKOUT",
            cardBrands: c2pData.cardBrands,
            dpaData: {
                "dpaPresentationName": "SHOP.COM",
                "dpaName": "SHOP.COM"
            }
        }

        const initializeClick2Pay = async () => {
            // @ts-ignore
            window.c2pInstance = new Click2Pay();
            // @ts-ignore
            await Click2PayInitializer.initHandler(window.c2pInstance, initParams);
            // @ts-ignore
            Click2PayCards.getUserCards(window.c2pInstance)
                .then((response: any) => {
                    setHasSavedCards(response.consumerPresent === true)
                })
                .catch((error: { message: string; }) => {
                    console.log("getUserCards error: " + error.message);
                })
        };
        waitForC2PLibrary();
    }, []);

    const initiateOTPValidation = () => {
        // @ts-ignore
        initiateValidation(window.c2pInstance);
    };

    const addNewClick2PayCard = () => {
        Click2PayNewCard.openAddCardOverlay();
    }

    const closeAddCardOverlay = () => {
        Click2PayNewCard.closeAddCardOverlay();
    }

    const saveNewCard = () => {
        // @ts-ignore
        Click2PayNewCard.addCardToClick2Pay(window.c2pInstance);
    }

    return (
        <div className="checkout-method-click-to-pay">
            {hasSavedCards ? (
                <div className="checkout-method-save-information">
                    <div className="js-c2p-existing-user click-to-pay">
                        <div className="js-c2p-access-cards-msg click-to-pay">
                            <div className="checkout-method-click-to-pay-text">
                                Pay with your cards saved to Click to Pay for fast, secure checkout
                            </div>
                            <button className="checkout-method-click-to-pay-text click-to-pay__btn" type="button"
                                onClick={() => initiateOTPValidation()}>Access your cards
                            </button>
                        </div>
                        <src-card-list card-brands={cardBrandsString} display-preferred-card="true"
                            card-selection-type="radioButton" display-sign-out="false" />
                        <div className="js-c2p-empty-card-list-msg" style={{ display: "none" }}>
                            <div className="checkout-method-click-to-pay-text click-to-pay__warn">
                                <Warn />
                                <p className="click-to-pay__warn-text">There are no cards in your Click to Pay
                                    wallet. Add a card to check out with your Click to Pay Profile.</p>
                            </div>
                        </div>
                        <div className="js-c2p-add-new-card click-to-pay__btn-container" style={{ display: "none" }}>
                            <Add />
                            <button className="click-to-pay__btn" type="button"
                                onClick={() => addNewClick2PayCard()}>
                                Add new card with Click to Pay
                            </button>
                        </div>
                    </div>
                </div>
            ) :
                <div className="checkout-method-save-information">
                    <div className="checkout-method-click-to-pay-text">
                        Save my information with Click to Pay
                    </div>
                    <div className="checkout-method-click-to-pay-text">
                        for fast, secure checkout.{" "}
                        <span className="learn-more">Learn more</span>
                    </div>
                    <div>+ Continue to Click to Pay</div>
                    <src-card-list card-brands={cardBrandsString} />
                </div>
            }
            <div className="js-c2p-otp-container" style={{ display: "none" }}>
                <src-otp-input type="overlay" data-otp-value="" display-cancel-option="true"
                    masked-identity-value=""
                    network-id=""
                    hide-loader="false"
                    display-remember-me="true"
                    auto-submit="true" error-reason="">
                </src-otp-input>
            </div>
            <div className="js-c2p-otp-selection-container" style={{ display: "none" }}>
            </div>
            <div className="js-c2p-payment-add-card-container click-to-pay__iframe-container" role="dialog" aria-modal="true"
                aria-labelledby="dialogClickToPayAddCard" style={{ display: "none" }}>
                <form id="dialogClickToPayAddCard"
                    className="js-c2p-payment-add-card-form click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                     click-to-pay__iframe-modal--scrollable">
                    <div className="click-to-pay__iframe-content--scrollable">
                        <div className="click-to-pay__heading">Card Information</div>
                        <div>
                            <src-card-list card-brands={cardBrandsString} />
                            <div className="checkout-method-click-to-pay-text">Save my information with Click to Pay for
                                fast,
                                secure checkout.
                            </div>
                        </div>
                        <CardInformation shopperId="" initialData={{
                            ...shopperSavedPayment,
                        }} />
                    </div>
                    <div className="form-footer form-footer__dual-button">
                        <Button
                            label="Cancel"
                            type="secondary"
                            onClick={closeAddCardOverlay}
                        />
                        <Button label="Save" type="primary"
                            onClick={saveNewCard} />
                    </div>
                </form>
            </div>
            <div className="js-c2p-payment-iframe-container click-to-pay__iframe-container" role="dialog"
                aria-modal="true" aria-labelledby="dialogClickToPay" style={{ display: "none" }}>
                <div className="click-to-pay__iframe-modal">
                    <iframe id="dialogClickToPay" name="c2pPaymentIframe"
                        className="click-to-pay__iframe-content"></iframe>
                </div>
            </div>
            <input className="js-c2p-payment-data" type="hidden" />
        </div>
    );
};
