declare global {
  interface Window {
    google: typeof google;
    FS: {
      getCurrentSessionURL: () => string;
    };
    ApplePaySession?: ApplePaySession;
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
interface ApplePayLineItem {
  label: string;
  amount: string;
}

interface ApplePayPaymentRequest {
  countryCode: string;
  currencyCode: string;
  total: ApplePayLineItem;
  supportedNetworks?: string[];
  merchantCapabilities?: string[];
  lineItems?: ApplePayLineItem[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  shippingType?: "shipping" | "delivery" | "store" | "service";
}

interface ApplePayPaymentMethod {
  displayName: string;
  network: string;
  type: string;
}

interface ApplePayPaymentToken {
  paymentData: Record<string, unknown>;
  paymentMethod: ApplePayPaymentMethod;
  transactionIdentifier: string;
}

interface ApplePayPayment {
  token: ApplePayPaymentToken;
  billingContact?: Record<string, unknown>;
  shippingContact?: Record<string, unknown>;
}

interface ApplePayValidateMerchantEvent {
  validationURL: string;
}

interface ApplePayPaymentAuthorizedEvent {
  payment: ApplePayPayment;
}

interface ApplePaySession {
  canMakePayments(): unknown;
  new (version: number, request: ApplePayPaymentRequest): ApplePaySession;
  begin(): void;
  abort(): void;
  completeMerchantValidation(merchantSession: any): void;
  completePayment(status: number): void;
  onvalidatemerchant: (event: ApplePayValidateMerchantEvent) => void;
  onpaymentauthorized: (event: ApplePayPaymentAuthorizedEvent) => void;
  oncancel?: () => void;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
}

export {};