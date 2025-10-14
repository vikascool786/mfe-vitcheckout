declare global {
  interface Window {
    google: typeof google;
    FS: {
      getCurrentSessionURL: () => string;
    };
    ApplePaySession: {
      canMakePayments(): boolean;
      new (version: number, request: ApplePayPaymentRequest): ApplePaySession;
      STATUS_SUCCESS: number | undefined
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "apple-pay-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        buttonstyle?: string;
        type?: string;
        locale?: string;
      };
    }
  }
}

// Apple Pay types
interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  total: { label: string; amount: string };
  supportedNetworks?: string[];
  merchantCapabilities?: string[];
  lineItems?: { label: string; amount: string }[];
}

interface ApplePayPayment {
  token: any;
  billingContact?: any;
  shippingContact?: any;
}

interface ApplePaySession {
  new (version: number, request: ApplePayPaymentRequest): ApplePaySession;
  begin(): void;
  completeMerchantValidation(merchantSession: any): void;
  completePayment(status: number): void;
  onvalidatemerchant: (event: { validationURL: string }) => void;
  onpaymentauthorized: (event: { payment: ApplePayPayment }) => void;
}

export {};