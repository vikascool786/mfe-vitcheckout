import React, { useEffect, useState } from "react";
import { fetchShoppersPaymentMethods } from "../api/service/ShoppersPaymentMethods";
import CardOptions from "../assets/images/CardOptions.png";
import ClickToPay from "../assets/images/ClickToPay.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Back } from "../assets/svgs/Back";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import {
  IPaymentOptionProps,
  PaymentOption,
} from "../payment-method-option/PaymentMethodOption";
import { TextUpdates } from "../text-updates/TextUpdates";
import "./PaymentMethods.scss";

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
  const [allPaymentOptions, setAllPaymentOptions] = useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedCards, setSavedCards] = useState<IPaymentOptionProps[]>([]);

  useEffect(() => {
    const shopperID =
      "mZjhWVwjzVzpVzhYxWzpeWXzUzUxepzXYXVWzkjh"; //shopper with empty wallet
    //"WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"; // shopper with multiple types of cards
    //"hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; /*todo - need to update with dynamic shopperId*/

    const fetchShoppersSavedPayments = async () => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperID);

        const shopperPayments: IPaymentOptionProps[] = response
          .map((item: any, index: number) => ({
            name: item.type,
            image: item.imageUrl,
            selected: item.preferred,
            index,
            size: 0,
            onChange: () => { },
            isSavedCard: true,
            shopperSavedPayment: {
              id: item.id,
              expirationDate: item.expires as string | "",
              cardMask: item.mask as string | "",
              preferred: item.preferred as boolean,
              type: item.type as string | "",
              accountName: item.accountName as string | "",
              name: item.type,
              image: item.imageUrl,
              address: {} as Address,
            },
          }))
          .sort((a: { selected: boolean; }, b: { selected: boolean; }) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0));

        setSavedCards(shopperPayments);
        updatePaymentOptions(shopperPayments);
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    const updatePaymentOptions = (shopperPayments: IPaymentOptionProps[]) => {
      const hasSavedCards = shopperPayments.length > 0;
      const displayedOptions = [
        ...(hasSavedCards && shopperPayments && shopperPayments[0]
          ? [shopperPayments[0]]
          : [staticPaymentMethods[0]]),
        ...(isExpanded && shopperPayments ? shopperPayments.slice(1) : []),
        staticPaymentMethods?.[1] ?? [], // PayPal
        staticPaymentMethods?.[2] ?? [], // Sezzle
      ];

      setAllPaymentOptions(displayedOptions as IPaymentOptionProps[]);
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
