import React, { useEffect, useState } from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { FormField } from "../component/Form/Field/FormField";
import "./Contact.scss"
import { fetchShopperDirectory } from "../api/service/ShopperDirectory";
import { isEZRegShopper, isFullRegShopper, ShopperDirectory } from "../interfaces/ShopperDirectory";
import { fetchShopperDetail } from "../api/service/ShopperDetail";
import { postEZReg, REG_TYPE_GUEST_CHECKOUT } from "../api/service/ShopperEZReg";
import { buildInitialGuestOrder, deleteUniversalOrder } from "../api/service/Order";
import { CustomerProfile } from "../interfaces/CustomerProfile";
import { Address } from "../interfaces/Address";
import { Order } from "../interfaces/Order";
import { isCartOrder } from "../utils/OrderUtils";

interface IContactProps {
    portalId: string;
    cartId: string;
    setCustomerId: any;
    setOrderData: any;
    setUseCartSummary: any;
    customerData: CustomerProfile | null;
    setShopperEmail: any;
    addressList: Address[];
    order: Order | undefined;
    setCurrentPortalId: any;
}

export const Contact: React.FC<IContactProps> = ({
    portalId,
    cartId,
    setCustomerId,
    setOrderData,
    setUseCartSummary,
    customerData,
    setShopperEmail,
    addressList,
    order,
    setCurrentPortalId,
}) => {

    function getSignInRegisterUrl(){
        return `/nbts/login-myaccount.xhtml?ischeckout=true&returnurl=/nbts/checkout/v2`;
    }

    const [email, setEmail] = useState("");
    const [debouncedEmail, setDebouncedEmail] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [isFullRegEmail, setIsFullRegEmail] = useState(false);
    const [showOptInCheckbox, setShowOptInCheckbox] = useState(true);
    const [isOptInChecked, setIsOptInChecked] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [emailTouched, setEmailTouched] = useState(false);
    // const [buildGuestOrder, setBuildGuestOrder] = useState(false); //AI-111735

    useEffect(() => {
        const emailInput = document.querySelector(".js-email-input") as HTMLInputElement;
        if(emailInput){
            emailInput.focus();
        }
    }, []);

    useEffect(() => {
        if(order){
            setEmail(order.email);
        }
        // setBuildGuestOrder((!order || isCartOrder(order)));
    }, [order]);

    useEffect(() => {
        if(customerData){
            setEmail(customerData?.email_address);
            setShopperEmail(customerData?.email_address);
        }
    }, [customerData]);

    useEffect(() => {
        setIsValidEmail(false); //invalidate email when it gets changed
        const handler = setTimeout(() => {
            setDebouncedEmail(email);
        }, 500); // 500ms after last keypress

        return () => clearTimeout(handler);
    }, [email]);

    useEffect(() => {
        setIsFullRegEmail(false);
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsValidEmail(emailPattern.test(debouncedEmail));
    }, [debouncedEmail]);

    useEffect(() => {
        if(isValidEmail){
            setEmailErrorMessage("");
            //do directory call or EZ reg shopper
            fetchShopperDirectory(email)
                .then((response: ShopperDirectory) => {
                    if(response?.foreign){
                        setEmailErrorMessage("The email address entered is for an account on a another SHOP.COM site, please use a valid email");
                    } else if(isFullRegShopper(response) || isEZRegShopper(response)) {
                        //commenting out sign in alert since they chose to come in as guest. Keeping in case we decide otherwise
                        //setIsFullRegEmail(isFullRegShopper(response)); //show sign in alert in UI
                        setShowOptInCheckbox(false);
                        fetchShopperDetail(response.shopperID)
                            .then(response => {
                                setCustomerId(response.pcid);
                                setCurrentPortalId(response.portal?.portalId);
                                const shippingAddress = addressList && addressList.length > 0 ? addressList[0] : null;
                                // if(buildGuestOrder){
                                    const orderResponse = buildInitialGuestOrder(cartId, portalId, response.pcid, shippingAddress);
                                    orderResponse.then((res) => {
                                        setOrderData(res?.response.success?.data || null);
                                        setUseCartSummary(false);
                                        setShopperEmail(email);
                                    });
                                // }
                            })
                    } else {
                        postEZReg(email, portalId, REG_TYPE_GUEST_CHECKOUT, (isOptInChecked && showOptInCheckbox))
                            .then((response) => {
                                const ezPcid = response?.shopper?.pcid;
                                setCustomerId(ezPcid);
                                const shippingAddress = addressList && addressList.length > 0 ? addressList[0] : null;
                                // if(buildGuestOrder){
                                    const orderResponse = buildInitialGuestOrder(cartId, portalId, ezPcid, shippingAddress);
                                    orderResponse.then((res) => {
                                        setOrderData(res?.response.success?.data || null);
                                        setUseCartSummary(false);
                                        setShopperEmail(email);
                                    });
                                // }
                            }).catch((error: any) => {
                                console.error("EZ reg error: ", error);
                                const errorMessage =
                                    error?.response?.data ??
                                    error?.message ??
                                    "This email address cannot be used. Please try again.";
                                setEmailErrorMessage(errorMessage);
                            });
                    }
                });
        }else{
            setShowOptInCheckbox(true);
            if(email.length > 1){
                setEmailErrorMessage("Please enter a valid email address");
            } else{
                setEmailErrorMessage("");
            }
        }
    }, [isValidEmail]);

    const handleOptInCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsOptInChecked(event.target.checked);
    };

    const handleSignInLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        // delete the order so it is rebuilt when re-entering checkout
        deleteUniversalOrder(cartId).finally(() => {
            window.location.href = getSignInRegisterUrl();
        })
    };

    return (
        <div className="checkout-contact">
            <form className="qa-contact-section">
                <div className="checkout-form-container">
                    <div className="form-header">
                        <FormHeading title="Contact"/>
                        <div className="checkout-contact__link"><a href="#" onClick={handleSignInLink}>Sign In or Create Account</a>
                        </div>
                    </div>
                    <div className="form-field-container-full">
                        <FormField
                            qaTag="qa-email"
                            name="email"
                            label="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            errorMessage={
                                emailTouched && !email
                                    ? "Email is required"
                                    : emailErrorMessage
                            }
                            className="js-email-input"
                        />
                    </div>
                    { showOptInCheckbox && (
                        <div className="checkout-contact__checkbox">
                            <FormField
                                type="checkbox"
                                name="boxChecked"
                                qaTag={"qa-marketing-checkbox"}
                                className="checkbox"
                                label="Email me with marketing updates"
                                checked={isOptInChecked}
                                onChange={handleOptInCheckboxChange}
                            />
                        </div>

                    )}
                    {isFullRegEmail && (
                        <div className="alert-message">
                            <a href="#" onClick={handleSignInLink}>Sign In to redeem rewards and coupons.</a>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
