import React, { PropsWithChildren, Suspense } from 'react'
import { ApplePayButton } from '../component/ApplePay/ApplePay';
import "./ExpressCheckout.scss";
import { useApplePayAvailable } from '../component/ApplePay/useApplePayAvailable';
import Divider from '../component/Divider/Divider';

interface ExpressCheckoutProps {
    confirmOrder: () => void;
  siteId: string;
  portalId: string;
  isApplePayActive: boolean;
  shopperId?: string;
  email?: string;
  customerId?: string;
  isGuest?: boolean;
  showDivider?: boolean;
}
const ExpressCheckout: React.FC<ExpressCheckoutProps> =   (
  {
    confirmOrder,
    siteId,
    portalId,
    isApplePayActive,
    shopperId='',
    email = '',
    customerId = '',
    isGuest = true,
    showDivider = true
  }
) => {
  const {eligible: isApplePaySupported} = useApplePayAvailable();
  const ExpressContainer : React.FC<PropsWithChildren<{isGuest?: boolean}>> = ({isGuest, children}) => {
    return (<>
    {
      isGuest ? (<>
        {children}
        </>) : (<div className="checkout-form-container">{children}</div>)
    }
    </>)
  }

  return (<>
    {
      isApplePaySupported && isApplePayActive ?<ExpressContainer isGuest={isGuest}> <div className="express-checkout-container">
      <h3>Express Checkout</h3>
      <div className="express-checkout-options">
      <ApplePayButton
         confirmOrder={confirmOrder} 
         siteId={siteId}
         portalId={portalId}
         email={email}
         shopperId={shopperId}
         customerId={customerId}
         isGuest={isGuest}
         />
      </div>
    
     
    </div>
    {showDivider && <Divider content="OR"/>}</ExpressContainer> : <></>
    }
  </>)
};
export default ExpressCheckout;