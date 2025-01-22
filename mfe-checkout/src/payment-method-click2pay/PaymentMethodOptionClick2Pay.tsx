import React, { useEffect, useState } from "react";
import Click2PayInitializer from "./Click2PayInitializer";
import Click2PayCards from "./Click2PayCards";
import Click2PayNewCard from "./Click2PayNewCard";
import { initiateValidation } from "./Click2PayOTP";
import "./PaymentOptionClick2Pay.scss";
import {Add} from "../assets/icons/Add";
import {Warn} from "../assets/icons/Warn";
import {ShopperSavedPayments} from "../interfaces/ShopperSavedPayments";
import {Button} from "../component/Button/Button";
import $ from "jquery";
import {fetchCustomerProfileData} from "../api/service/CustomerProfile";
import {Click2PayData} from "./Click2PayData";
import {creditCards} from "../payment-method/PaymentType";
import Click2PayCardLoader from "./Click2PayCardLoader";
import {GET_C2P_DPAID} from "../utils/urlResolver";
import {Order} from "../interfaces/Order";
import {CardInputs} from "./CardInputs";

interface IClick2PayProps {
    pcid: string;
    order?: Order;
}

const c2pCustomerData: Click2PayData = {
    mcc: "5963",
    email: "",
    transactionAmount: 0,
    hasAutoship: false,
    mobilePhone: "",
    cardBrands: ["mastercard", "visa", "discover", "amex"],
    address: {
        first: "",
        last: "",
        address1: "",
        address2: "",
        address3: "",
        city: "",
        state: "",
        zip: ""
    }
}

export const PaymentOptionClick2Pay: React.FC<IClick2PayProps> = ({ pcid, order }) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [hasSavedCards, setHasSavedCards] = useState(false);
    const [cardData, setCardData] = useState([]);
    const [c2pData, setC2pData] = useState(c2pCustomerData);

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
        if (order) {
            const acceptedCreditCards = order.paymentMethods.filter((method) => method.visible);
            const acceptedCardNameList: string[] = acceptedCreditCards
                .map((accepted) =>
                    creditCards.find((card) => card.typeId === accepted.typeID)?.altName
                )
                .filter((altName): altName is string => Boolean(altName));
            setC2pData((prevData) => ({
                ...prevData,
                cardBrands: acceptedCardNameList,
                transactionAmount: order ? order.totals.price : 0,
            }));
        }
    }, [order]);

    useEffect(() => {
        if (c2pData) {
            fetchCustomerProfileData(pcid)
                .then((response: any) => {
                    setC2pData((prevData) => ({
                        ...prevData,
                        email: response.data.email_address,
                        mobilePhone: response.data.cell_phone,
                        address: {
                            ...c2pCustomerData.address,
                            first: response.data.first_name,
                            last: response.data.last_name,
                            address1: response.data.home_address?.address_1,
                            address2: response.data.home_address?.address_2,
                            address3: response.data.home_address?.address_3,
                            city: response.data.home_address?.city,
                            state: response.data.home_address?.state,
                            zip: response.data.home_address?.postal_code,
                        },
                    }));
                })
                .catch((error: { message: string; }) => {
                    console.error("Failed to fetch shopper profile data:", error);
                })
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('c2pData', JSON.stringify(c2pData));
    }, [c2pData]);

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
            srcDpaId: `${GET_C2P_DPAID()}`,
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
                    const hasCookiedCards = response.length > 0;
                    setHasSavedCards(response.consumerPresent === true || hasCookiedCards);
                    if(hasCookiedCards){
                        setCardData(response);
                    }
                })
                .catch((error: { message: string; }) => {
                    console.error("getUserCards error: " + error.message);
                })
        };
        waitForC2PLibrary();
    }, []);

    useEffect(() => {
        if (cardData.length > 0) {
            // @ts-ignore
            Click2PayCardLoader.loadSRCCardsOnPage(cardData, window.c2pInstance, true, false, true);
        }
    }, [cardData]);

    useEffect(() => {
        $(".js-c2p-payment-add-card-form").parsley();
    }, []);

    useEffect(() => {
        document.addEventListener("c2pError", (event) => {
            const customEvent = event as CustomEvent<{ message: string }>;
            setErrorMessage(customEvent.detail.message);
        });
    }, []);

    const initiateOTPValidation = () => {
        // @ts-ignore
        initiateValidation(window.c2pInstance);
    };

    const addNewClick2PayCard = () => {
        Click2PayNewCard.openAddCardOverlay();
    }

    const closeAddCardOverlay = (event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        Click2PayNewCard.closeAddCardOverlay();
    }

    const saveNewCard = () => {
        if(hasValidNewCardFormFields()){
            // @ts-ignore
            Click2PayNewCard.addCardToClick2Pay(window.c2pInstance);
        }
    }

    const hasValidNewCardFormFields = () => {
        const form = document.querySelector(
            ".js-c2p-payment-add-card-form"
        ) as HTMLElement;
        $(form).parsley().validate();
        return $(form).parsley().isValid();
    };

    const handleCloseErrorMessage = () => {
        setErrorMessage("");
    };

    return (
        <div className="payment-option-container">
            <div className="js-payment-promo-c2p"></div>
            <div className="checkout-method-click-to-pay">
                {hasSavedCards ? (
                        <div className="checkout-method-save-information">
                            <div className="js-c2p-container click-to-pay">
                                <div className="js-c2p-access-cards-msg click-to-pay">
                                    <div className="checkout-method-click-to-pay-text">
                                        Pay with your cards saved to Click to Pay for fast, secure checkout
                                    </div>
                                    <button className="checkout-method-click-to-pay-text click-to-pay__btn" type="button"
                                            onClick={() => initiateOTPValidation()}>Access your cards
                                    </button>
                                </div>
                                <src-card-list card-brands={cardBrandsString} display-preferred-card="true"
                                               card-selection-type="radioButton" display-sign-out="false"/>
                                <div className="js-c2p-empty-card-list-msg" style={{display: "none"}}>
                                    <div className="checkout-method-click-to-pay-text click-to-pay__warn">
                                        <Warn/>
                                        <p className="click-to-pay__warn-text">There are no cards in your Click to Pay
                                            wallet. Add a card to check out with your Click to Pay Profile.</p>
                                    </div>
                                </div>
                                <div className="js-c2p-add-new-card click-to-pay__btn-container" style={{display: "none"}}>
                                    <Add/>
                                    <button className="click-to-pay__btn" type="button"
                                            onClick={() => addNewClick2PayCard()}>
                                        Add new card with Click to Pay
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) :
                    <div className="js-c2p-container">
                        <div className="checkout-method-save-information js-c2p-save-card-msg">
                            <div className="checkout-method-click-to-pay-text">
                                Save my information with Click to Pay
                            </div>
                            <div className="checkout-method-click-to-pay-text">
                                for fast, secure checkout.{" "}
                                <span className="learn-more">Learn more</span>
                            </div>
                            <div className="click-to-pay__btn-container">
                                <Add/>
                                <button className="click-to-pay__btn" type="button"
                                        onClick={() => addNewClick2PayCard()}>
                                    Continue to Click to Pay
                                </button>
                            </div>
                        </div>
                        <src-card-list card-selection-type="radioButton" display-preferred-card="true" card-brands={cardBrandsString}/>
                    </div>
                }
                <div className="js-c2p-otp-container" style={{display: "none"}}>
                    <src-otp-input type="overlay" data-otp-value="" display-cancel-option="true"
                                   masked-identity-value=""
                                   network-id=""
                                   hide-loader="false"
                                   display-remember-me="true"
                                   auto-submit="true" error-reason="">
                    </src-otp-input>
                </div>
                <div className="js-c2p-otp-selection-container" style={{display: "none"}}>
                </div>
                {errorMessage.length > 0 && (
                    <div className="click-to-pay__iframe-container" role="dialog"
                         aria-modal="true"
                         aria-labelledby="dialogClickToPayAddCard">
                        <div className="click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                    click-to-pay__iframe-modal--error
                     click-to-pay__iframe-modal--scrollable">
                            <div>
                                <button
                                    className="overlay-simple__close overlay-simple__close--dark margin-top"
                                    onClick={handleCloseErrorMessage}>
                                    <span className="collapse-text">Close</span>
                                    <span className="material-icons" aria-hidden="true">close</span>
                                </button>
                            </div>
                            <div className="error-msg error-msg--padding">{errorMessage}</div>
                        </div>

                    </div>
                )}
                <div className="js-c2p-payment-add-card-container click-to-pay__iframe-container" role="dialog"
                     aria-modal="true"
                     aria-labelledby="dialogClickToPayAddCard" style={{display: "none"}}>
                    <form id="dialogClickToPayAddCard"
                          className="js-c2p-payment-add-card-form click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                     click-to-pay__iframe-modal--scrollable">
                        <div>
                            <button
                                className="overlay-simple__close overlay-simple__close--dark margin-top"
                                onClick={closeAddCardOverlay}>
                                <span className="collapse-text">Close</span>
                                <span className="material-icons" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <div>
                            <div
                                className="click-to-pay__iframe-content--scrollable click-to-pay__iframe-content--padding">
                                <div className="click-to-pay__heading">Card Information</div>
                                <div>
                                    <src-card-list card-brands={cardBrandsString}/>
                                    <div className="checkout-method-click-to-pay-text">Save my information with Click to
                                        Pay
                                        for
                                        fast,
                                        secure checkout.
                                    </div>
                                </div>
                                <CardInputs/>
                            </div>
                            <div className="form-footer form-footer__dual-button">
                                <Button
                                    label="Cancel"
                                    btnType="secondary"
                                    onClick={closeAddCardOverlay}
                                />
                                <Button label="Save" btnType="primary"
                                        onClick={saveNewCard}/>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="js-c2p-payment-iframe-container click-to-pay__iframe-container" role="dialog"
                     aria-modal="true" aria-labelledby="dialogClickToPay" style={{display: "none"}}>
                    <div className="click-to-pay__iframe-modal">
                        <iframe id="dialogClickToPay" name="c2pPaymentIframe"
                                className="click-to-pay__iframe-content"></iframe>
                    </div>
                </div>
                <input className="js-c2p-payment-data" type="hidden"/>
            </div>
        </div>
    );
};
