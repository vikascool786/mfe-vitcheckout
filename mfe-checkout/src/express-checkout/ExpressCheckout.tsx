import React, { Suspense } from 'react'
import { ApplePayButton } from '../component/ApplePay/ApplePay';
import "./ExpressCheckout.scss";
import { useApplePayAvailable } from '../component/ApplePay/useApplePayAvailable';
import Divider from '../component/Divider/Divider';

interface ExpressCheckoutProps {
    confirmOrder: () => void;
  siteId: string;
  portalId: string;
}
const ExpressCheckout: React.FC<ExpressCheckoutProps> =   (
  {
    confirmOrder,
    siteId,
    portalId
  }
) => {
  const isApplePaySupported = useApplePayAvailable();

  return (<>
    {
      isApplePaySupported ?<> <div className="express-checkout-container">
      <h3>Express Checkout</h3>
      <div className="express-checkout-options">
      <div className="apple-pay-button-wrapper">
      <ApplePayButton
         confirmOrder={confirmOrder} 
         siteId={siteId}
         portalId={portalId}
         />
      </div>
      </div>
    
     
    </div>
    <Divider content="OR"/></> : <></>
    }
  </>)
};
export default ExpressCheckout;