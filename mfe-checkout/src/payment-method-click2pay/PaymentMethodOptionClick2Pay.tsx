import React, { useEffect, useState } from "react";
import { GET_CLICK2PAY_DPA_ID } from "../utils/ApiConstants";
import Click2PayInitializer from "./Click2PayInitializer";
import Click2PayCards from "./Click2PayCards";
import { initiateValidation } from "./Click2PayOTP";

export const PaymentOptionClick2Pay: React.FC = ({ }) => {
    const [hasSavedCards, setHasSavedCards] = useState(false);

    /*TODO: need to pass c2pdata in dynamically*/
    const c2pData = {
        mcc: "5963",
        email: "staging_c2p_0307@yopmail.com",
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

    useEffect(() => {
        localStorage.setItem('c2pData', JSON.stringify(c2pData));
    }, []);

    useEffect(() => {
        console.log("do c2p initialization");
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
        const promise = initializeClick2Pay();
    }, []);

    const initiateOTPValidation = () => {
        // @ts-ignore
        initiateValidation(window.c2pInstance);
    };

    return (
        <div className="checkout-method-click-to-pay">
            {hasSavedCards ? (
                <div className="checkout-method-save-information">
                    <div className="checkout-method-click-to-pay-text">
                        Pay with your cards saved to Click to Pay for fast, secure checkout
                    </div>
                    <button onClick={() => initiateOTPValidation()}>Access your cards</button>
                    <src-card-list card-brands={cardBrandsString} />
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
                <src-otp-channel-selection type="overlay" display-cancel-option="true"></src-otp-channel-selection>
            </div>
        </div>
    );
};
