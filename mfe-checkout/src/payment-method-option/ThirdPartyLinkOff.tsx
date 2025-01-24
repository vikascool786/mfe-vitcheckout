import React from "react";
import "./ThirdPartyLinkOff.scss"
import {IPaymentMethod} from "../interfaces/PaymentMethod";

export interface IThirdPartyLinkOffProps {
    paymentMethod: IPaymentMethod;
}

export const ThirdPartyLinkOff: React.FC<IThirdPartyLinkOffProps> = ({paymentMethod}) => {

    return (
        <div className="third-party-link-off-container">
            <img className="third-party-link-off-container__icon" src="https://img.shop.com/Image/local/images/cc/thirdPartyPaymentLinkOff.svg" alt={"Third party payment link off"}/>
            <div className="third-party-link-off-container__text">After clicking "Pay with {paymentMethod.accountName}", you will be redirected to {paymentMethod.accountName} to complete your purchase securely.</div>
        </div>
    );
};
