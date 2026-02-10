import React, { useCallback, useEffect, useRef, useState } from "react";
import { validateEmail } from "../../utils/helpers/Helper";
import "./ApplePayEmailDialog.scss";

type Props = {
  open: boolean;
  customerId:string;
  initialEmail?: string;
  onCreateSession: () => void;
  onClose: (next: string) => void;
  onSubmit: (email: string) => void;
  errorMessage: string;
};



export default function ApplePayEmailDialog({ open, initialEmail = "", onClose, onSubmit, onCreateSession, customerId , errorMessage}: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const applePayRef = useRef<HTMLElement | null>(null);
  const emailRef = useRef<string>('');

  useEffect(() => {
    emailRef.current = email;
    const isValid = validateEmail(email);
    setIsValid(isValid);
    const handleEmail = setTimeout(() => {
        if (!isValid) {
            return;
        }
        onSubmit(email);
    }, 500);
    return () => {
       return clearTimeout(handleEmail);
    }
  }, [email])



  const handleSession = useCallback(() => {
    const isValidEmail = validateEmail(emailRef.current);
    setIsValid(isValidEmail);
    if (!isValidEmail) {
        return;
    }
    onCreateSession();
    onClose('createSession');
  }, [])

  const setApplePayRef = useCallback((node: HTMLElement | null) => {
    if (!node) {
        return;
    };
  
    // Prevent double binding
    if (applePayRef.current) {
        applePayRef.current.removeEventListener("click", handleSession);
    };
    applePayRef.current = node;
    node.addEventListener("click", handleSession);
  }, [customerId]);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setTouched(false);
      // focus the input after animation
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open, initialEmail]);

  useEffect(() => {
    return () => {
      if (applePayRef.current) {
        applePayRef.current.removeEventListener("click", handleSession);
        applePayRef.current = null;
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="apple-email-backdrop" role="dialog" aria-modal="true" aria-label="Enter email for Apple Pay">
      <div className="apple-email-sheen" aria-hidden="true" />
      <div className={`apple-email-modal ${touched && !isValid ? 'show-email-error': ''} ${customerId ? 'show-apple-pay': ''}`}>
        <div className="apple-header">
          <svg className="apple-logo" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
<path fill="currentColor" d="M16.365 1.43c0 1.02-.38 2.01-1.07 2.83-.72.86-1.93 1.63-3.06 1.46-.06-.94.36-1.9 1.03-2.6.76-.8 1.96-1.49 3.1-1.69.02-.01.05-.01.08-.01.02 0 .05 0 .08.01zM21.98 13.09c-.01-3.37 2.75-4.99 2.87-5.06-1.57-2.28-4.02-2.59-4.89-2.62-2.08-.21-4.05 1.22-5.09 1.22-1.06 0-2.69-1.18-4.43-1.15-2.28.02-4.38 1.33-5.56 3.36-2.38 4.1-.61 10.17 1.71 13.5 1.13 1.48 2.47 3.14 4.23 3.09 1.7-.05 2.34-1.06 4.38-1.06 2.02 0 2.6 1.06 4.37 1.03 1.83-.02 2.99-1.52 4.12-3.03 1.32-1.79 1.86-3.53 1.88-3.62-.04-.02-3.6-1.38-3.6-5.08z" />
</svg>
          <div className="title">Express Checkout</div>
        </div>

        <form className="apple-body" noValidate onSubmit={e => e.preventDefault()}>
          <div className="prompt">Enter an email</div>

          <label className={`apple-input ${touched && !isValid ? "invalid" : ""}`}>
            <input
              ref={inputRef}
              type="email"
              name="apple-email"
              autoComplete="email"
              placeholder="name@icloud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && !isValid}
            />
            <span className={`underline ${isValid ? "valid" : ""}`} />
            <span className="status-icon" aria-hidden>
              {isValid ? (
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M9 16.2l-3.5-3.5 1.41-1.41L9 13.38l7.09-7.09L17.5 7.7z" />
                </svg>
              ) : null}
            </span>
          </label>

          {touched && !isValid ? <div className="error">Please enter a valid email address.</div> : null}
          {isValid && !customerId && !errorMessage && <p>Checking...</p>}
          {errorMessage && <div className="error">{errorMessage}</div>}
         
          {customerId && <div className="actions" tabIndex={-1}>
                <apple-pay-button
                  ref={setApplePayRef}
                  buttonstyle="black"
                  type="check-out"
                  locale="en-US"
                  id="mfe-apple-pay-button"
                 />
                 <p>Loading...</p>
              </div>}
        </form>

        <button className="close-x" onClick={() => onClose('')} aria-label="Close dialog">
          ×
        </button>
      </div>
    </div>
  );
}