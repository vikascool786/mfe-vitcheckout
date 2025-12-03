import React, { Suspense } from 'react'
import { ApplePayButton } from '../component/ApplePay/ApplePay';
import "./ExpressCheckout.scss";
import { useApplePayAvailable } from '../component/ApplePay/useApplePayAvailable';

interface ExpressCheckoutProps {
    confirmOrder: () => void;
  updateErrorMessage: (newMessage: string) => void;
  pcid: string;
  cartId: string;
  siteId: string;
  portalId: string  
}
const ExpressCheckout: React.FC<ExpressCheckoutProps> =   (
  {
    confirmOrder,
    updateErrorMessage,
    pcid,
    cartId,
    siteId,
    portalId
  }
) => {
  const isApplePaySupported = useApplePayAvailable();

  return (<div className="express-checkout-container">
    <h3>Express Checkout</h3>
    <div className="express-checkout-options">
    <div className="apple-pay-button-wrapper">
    {isApplePaySupported ? <ApplePayButton
       confirmOrder={confirmOrder} 
       updateErrorMessage={updateErrorMessage}
       pcid={pcid}
       cartId={cartId}
       siteId={siteId}
       portalId={portalId}
       /> : <></>}
    </div>
    </div>
  
   
  </div>)
};
export default ExpressCheckout;