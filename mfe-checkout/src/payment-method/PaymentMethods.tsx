// In PaymentMethods.tsx

import React, { useEffect, useState } from "react";
import "./PaymentMethods.scss";
import CardOptions from "../assets/images/CardOptions.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { fetchShoppersPaymentMethods } from "../api/service/ShoppersPaymentMethods";
import { ShopperSavedPayments } from "../interfaces/ShopperSavedPayments";
import { TextUpdates } from "../text-updates/TextUpdates";
import ClickToPay from "../assets/images/ClickToPay.png";
import { IPaymentOptionProps, PaymentOption } from "./payment-option/PaymentOption";

const staticPaymentMethods: IPaymentOptionProps[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions,
    selected: false,
    index: 0,
    size: 0, // This will be updated later
    onChange: () => {},
  },
  {
    name: "PayPal",
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    onChange: () => {},
  },
  {
    name: "Sezzle",
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    onChange: () => {},
  },
];

export const PaymentMethod: React.FC = () => {
  const [allPaymentOptions, setAllPaymentOptions] = useState<IPaymentOptionProps[]>(staticPaymentMethods);

  useEffect(() => {
    const shopperID = "hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; /* Replace with dynamic ID */
    
    const fetchShoppersSavedPayments = async () => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperID);
        const shopperPayments = response.map((item: any, index: number) => ({
          name: item.type,
          image: item.imageUrl,
          selected: item.preferred,
          index,
          size: 0, // Updated later
          onChange: () => {}, // Will be replaced in render
          isSavedCard: true,
          shopperSavedPayment: {
            id: item.id,
            expirationDate: item.expires,
            cardMask: item.mask,
          },
        }));
        
        // Combine static and shopper payments
        const combinedOptions = [...shopperPayments, ...staticPaymentMethods];
        // Update the size property for each option to reflect the total number
        const optionsWithSize = combinedOptions.map((option, index) => ({
          ...option,
          index,
          size: combinedOptions.length,
        }));

        setAllPaymentOptions(optionsWithSize);
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    fetchShoppersSavedPayments();
  }, []);

  const handlePaymentMethodChange = (selectedIndex: number) => {
    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option, index) => ({
        ...option,
        selected: index === selectedIndex,
      }))
    );
  };

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <FormHeading title="Payment Method" />
        <div className="pm-sub-container">
          {allPaymentOptions.map((paymentOption, index) => (
            <PaymentOption
              key={paymentOption.shopperSavedPayment?.id || paymentOption.name}
              {...paymentOption}
              onChange={() => handlePaymentMethodChange(index)}
            />
          ))}
          <div className="checkout-method-click-to-pay">
            <div className="checkout-method-save-information">
              <div className={`checkout-method-click-to-pay-text`}>
                Save my information with Click to Pay
              </div>
              <div className="checkout-method-click-to-pay-text">
                for fast, secure checkout. <span className="learn-more">Learn more</span>
              </div>
              <div>+ Continue to Click to Pay</div>
              <img src={ClickToPay} alt="Click to Pay" />
            </div>
          </div>
        </div>
      </div>
      <TextUpdates />
      <div className="checkout-place-order">
        <div className="checkout-place-order-text">
          By clicking place order, you agree to the SHOP.COM Terms of Use and Privacy Policy.
        </div>
        <Button label="Place Order" type="primary" />
      </div>
    </div>
  );
};