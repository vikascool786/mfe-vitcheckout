import React from "react";
import CardOptions from "../assets/images/CardOptions.png";
import ClickToPay from "../assets/images/ClickToPay.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { PaymentMethodOption } from "../payment-method-option/PaymentMethodOption";
import { TextUpdates } from "../text-updates/TextUpdates";
import "./PaymentMethods.scss";

export interface IPaymentMethodOption {
  name: string;
  image: string;
  selected: boolean;
}

const paymentMethods: IPaymentMethodOption[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions, // Replace with actual image path
    selected: true, // Change to true if you want to set it as selected
  },
  {
    name: "PayPal",
    image: PayPal, // Replace with actual image path
    selected: false, // Change to true if you want to set it as selected
  },
  {
    name: "Sezzle",
    image: Sezzle, // Replace with actual image path
    selected: false, // Change to true if you want to set it as selected
  },
];

export const PaymentMethod: React.FC = () => {
  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <FormHeading title="Payment Method" />
        <div className="pm-sub-container">
          {paymentMethods.map((paymentMethod, index) => (
            <PaymentMethodOption
              key={index}
              paymentMethod={paymentMethod}
              index={index}
              onChange={() => {}}
              size={paymentMethods.length}
            />
          ))}
          <div className="checkout-method-click-to-pay">
            <div className="checkout-method-save-information">
              <div className={`checkout-method-click-to-pay-text`}>
                Save my information with Click to Pay
              </div>
              <div className="checkout-method-click-to-pay-text">
                for fast, secure checkout.{" "}
                <span className="learn-more">Learn more</span>
              </div>

              <div>+ Continue to Click to Pay</div>
              <img src={ClickToPay} />
            </div>
          </div>
        </div>
      </div>
      <TextUpdates />
      <div className="checkout-place-order">
        <div className="checkout-place-order-text">
          By clicking place order, you agree to the SHOP.COM Terms of Use and
          Privacy Policy.
        </div>
        <Button label="Place Order" type="primary" />
      </div>
    </div>
  );
};
