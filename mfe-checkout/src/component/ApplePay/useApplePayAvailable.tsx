import { useEffect, useState } from "react";

const waitForApplePay = (timeout = 2000) => {
    return new Promise(resolve => {
      if (window.ApplePaySession) return resolve(true);
      const interval = setInterval(() => {
        if (window.ApplePaySession) {
          clearInterval(interval);
          resolve(true);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(interval);
        resolve(false);
      }, timeout);
    });
  }

export function useApplePayAvailable() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let mounted = true;

    waitForApplePay().then(() => {
      if (!mounted) return;

      if (window.ApplePaySession &&
          window.ApplePaySession.canMakePayments()) {
        setSupported(true);
      }
    });

    return () => { mounted = false; };
  }, []);

  return supported;
}