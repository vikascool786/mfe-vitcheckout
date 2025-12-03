import React, { ComponentType } from 'react';

export const withApplePaySupport = <P extends {}>(
    WrappedComponent: ComponentType<P>
  ): ComponentType<P> => {

    const ApplePaySupportCheck = (props: P) => {
        const isApplePaySupported = typeof window !== 'undefined' && 'ApplePaySession' in window && window.ApplePaySession.canMakePayments();
        if (isApplePaySupported) {
            return <WrappedComponent {...props as P} />
        }
        return <></>;
     }

     return ApplePaySupportCheck;
  
}
