// src/payment-method/apple-pay/ApplePayButton.tsx
import React, { useEffect, useRef, useState } from "react";

type ApplePayPayment = {
  // minimal shape; expand fields as needed for your application
  token: any;
  billingContact?: any;
  shippingContact?: any;
};

interface ApplePayButtonProps {
  amount: string;
  label?: string;
  onPaymentSuccess?: (payment: ApplePayPayment) => void;
  onPaymentFailure?: (error: any) => void;
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  amount,
  label = "Shop.com",
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const buttonRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setIsApplePayAvailable(true);
      }
    } catch (error) {
      console.warn("Apple Pay not available:", error);
      setIsApplePayAvailable(false);
    }
  }, []);

  const handleApplePayClick = async () => {
    try {
      if (!window.ApplePaySession) {
        alert("Apple Pay is not supported on this browser.");
        return;
      }

      const request = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: { label, amount },
      };

      const session = new window.ApplePaySession(3, request);

      session.onvalidatemerchant = async (event) => {
        try {
          const response = await fetch("/api/validate-merchant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ validationURL: event.validationURL }),
          });
          const merchantSession = await response.json();
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error("Merchant validation failed:", error);
          session.abort();
        }
      };

      // 💳 Payment authorization
      session.onpaymentauthorized = async (event) => {
        try {
          console.log("Payment authorized:", event.payment);
          session.completePayment((session as any).constructor?.STATUS_SUCCESS ?? 1);
          onPaymentSuccess?.(event.payment);
        } catch (error) {
          console.error("Payment authorization error:", error);
          session.completePayment((session as any).constructor?.STATUS_FAILURE ?? 0);
          onPaymentFailure?.(error);
        }
      };

      session.begin();
    } catch (error) {
      console.error("Apple Pay error:", error);
      onPaymentFailure?.(error);
    }
  };

  // 🔗 Attach event listener
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const listener = (e: Event) => {
      e.preventDefault();
      handleApplePayClick();
    };

    button.addEventListener("click", listener);
    return () => button.removeEventListener("click", listener);
  }, [isApplePayAvailable]);

  if (!isApplePayAvailable) return null;

  return (
    <apple-pay-button
      ref={buttonRef as any}
      buttonstyle="black"
      type="buy"
      locale="en-US"
    ></apple-pay-button>
  );
};

export default ApplePayButton;