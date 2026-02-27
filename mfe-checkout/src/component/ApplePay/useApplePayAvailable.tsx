import { useEffect, useState } from "react";
import { detectApplePayEligibility } from "./ApplePayUtils";

const waitForApplePay = (timeout = 20000) => {
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
  const [state, setState] = useState({loading: true, eligible: false});


  useEffect(() => {
    let mounted = true;

    waitForApplePay().then(async () => {
      const supported = await detectApplePayEligibility();
      if (!mounted) return;
      if (!supported) {
        console.log("Apple pay is not supported")
      }
      setState({loading:false, eligible: supported});
    });

    return () => { mounted = false; };
  }, []);

  return state;
}