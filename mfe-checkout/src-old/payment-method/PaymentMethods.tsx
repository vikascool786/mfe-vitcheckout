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
import {
  IPaymentOptionProps,
  PaymentOption,
} from "./payment-option/PaymentOption";
import { WALLET } from "../data/Wallet";
import { Back } from "../assets/svgs/Back";

const staticPaymentMethods: IPaymentOptionProps[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions,
    selected: false,
    index: 0,
    size: 0,
    onChange: () => { },
  },
  {
    name: "PayPal",
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    onChange: () => { },
  },
  {
    name: "Sezzle",
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    onChange: () => { },
  },
];

export const PaymentMethod: React.FC = () => {
  const [allPaymentOptions, setAllPaymentOptions] = useState<
    IPaymentOptionProps[]
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedCards, setSavedCards] = useState<IPaymentOptionProps[]>([]);

  useEffect(() => {
    const shopperID = "hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; // Replace with dynamic ID

    const fetchShoppersSavedPayments = async () => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperID);
        const shopperPayments = response.map((item: any, index: number) => ({
          name: item.type,
          image: item.imageUrl,
          selected: index === 0, // Mark the first saved card as selected
          index,
          size: 0,
          onChange: () => { },
          isSavedCard: true,
          shopperSavedPayment: {
            id: item.id,
            expirationDate: item.expires,
            cardMask: item.mask,
          },
        }));

        setSavedCards(shopperPayments);
        updatePaymentOptions(shopperPayments);
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    const updatePaymentOptions = (shopperPayments: IPaymentOptionProps[]) => {
      const hasSavedCards = shopperPayments.length > 0;
      const displayedOptions = [
        ...(hasSavedCards ? [shopperPayments[0]] : [staticPaymentMethods[0]]),
        ...(isExpanded ? shopperPayments.slice(1) : []),
        staticPaymentMethods[1], // PayPal
        staticPaymentMethods[2], // Sezzle
      ];

      setAllPaymentOptions(displayedOptions);
    };

    fetchShoppersSavedPayments();
  }, [isExpanded]);

  const handlePaymentMethodChange = (selectedIndex: number) => {
    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option, index) => ({
        ...option,
        selected: index === selectedIndex,
      }))
    );
  };

  // Toggle function for expanding or collapsing the card list
  const toggleAccordion = () => {
    if (isExpanded) {
      // show all the cards
    } else {
      // only show one saved card or show credit/debit option if no card is saved
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
          <div className="pm-show-card" onClick={toggleAccordion}>
            <div>{isExpanded ? "Hide other cards" : "See other cards"}</div>
            <Back className={`accordion ${isExpanded ? "open" : "close"}`} />
          </div>
        </div>
        <div className="pm-sub-container">
          {allPaymentOptions.map((paymentOption, index) => (
            <PaymentOption
              key={paymentOption.shopperSavedPayment?.id || paymentOption.name}
              {...{ ...paymentOption, index }}
              onChange={() => handlePaymentMethodChange(index)}
            />
          ))}
          <div className="checkout-method-click-to-pay">
            <div className="checkout-method-save-information">
              <div className="checkout-method-click-to-pay-text">
                Save my information with Click to Pay
              </div>
              <div className="checkout-method-click-to-pay-text">
                for fast, secure checkout.{" "}
                <span className="learn-more">Learn more</span>
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
          By clicking place order, you agree to the SHOP.COM Terms of Use and
          Privacy Policy.
        </div>
        <Button label="Place Order" type="primary" />
      </div>
    </div>
  );
};
