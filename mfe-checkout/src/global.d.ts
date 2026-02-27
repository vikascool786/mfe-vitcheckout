declare global {
  interface Window {
    google: typeof google;
    FS: {
      getCurrentSessionURL: () => string;
    };
    ApplePaySession: any;
    ApplePayError: any;
    __MFE_RUNTIME__?: {
      isLTV?: boolean;
    };
  }
}
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "apple-pay-button": any;
    }
  }
}

export {};
