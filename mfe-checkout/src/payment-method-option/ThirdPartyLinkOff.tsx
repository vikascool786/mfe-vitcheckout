import React from "react";
import "./ThirdPartyLinkOff.scss"
import {IPaymentMethod} from "../interfaces/PaymentMethod";
import { useContentStrings } from "../hooks/useContentStrings";

export interface IThirdPartyLinkOffProps {
    paymentMethod: IPaymentMethod;
}

export const ThirdPartyLinkOff: React.FC<IThirdPartyLinkOffProps> = ({paymentMethod}) => {
    const { getString } = useContentStrings();
    return (
        <div className="third-party-link-off-container">
            {/* <img className="third-party-link-off-container__icon" src="https://img.mashop.com/Image/local/images/cc/thirdPartyPaymentLinkOff.svg" alt={"Third party payment link off"}/> */}
            <div className="third-party-link-off-container__text">{getString("payWithAccountRedirect",[paymentMethod.accountName,paymentMethod.accountName])}</div>
        </div>
    );
};
