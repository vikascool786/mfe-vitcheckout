import React, { useEffect, useState } from "react";
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
  const [allPaymentOptions, setAllPaymentOptions] = useState<
    IPaymentOptionProps[]
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedCards, setSavedCards] = useState<IPaymentOptionProps[]>([]);

  useEffect(() => {
    const shopperID =
    "mZjhWVwjzVzpVzhYxWzpeWXzUzUxepzXYXVWzkjh"; //shopper with empty wallet
    //"WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"; // shopper with multiple types of cards
    //"hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; /*todo - need to update with dynamic shopperId*/

    const fetchShoppersSavedPayments = async () => {
      try {
        const shopperPayments = [
          {
            id: 31164058,
            number: "411111******1111",
            expires: "01/2024",
            type: "Visa",
            typeID: 9,
            html: '<img src="https://img.shop.com/Image/local/images/cc/visa.jpg" alt="Visa" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/visa.svg",
            categoryID: 1,
            cvv: 1,
            token: "2df0e8b5-e8fb-11df-b64c-005056842e7d",
            accountName: "test test",
            mask: "4***********1111",
            expMonth: 1,
            expYear: 2024,
            addressId: 23168784,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/31164058?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/31164058/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 31176880,
            number: "491891******5005",
            expires: "07/2033",
            type: "Visa",
            typeID: 9,
            html: '<img src="https://img.shop.com/Image/local/images/cc/visa.jpg" alt="Visa" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/visa.svg",
            categoryID: 1,
            cvv: 1,
            token: "8206a9b9-e8fd-11df-b64c-005056842e7d",
            accountName: "test test",
            expMonth: 7,
            expYear: 2033,
            addressId: 23168783,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/31176880?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/31176880/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223740,
            number: "589258******5892",
            expires: "05/2026",
            type: "MasterCard",
            typeID: 6,
            html: '<img src="https://img.shop.com/Image/local/images/cc/mastercard.png" alt="MasterCard" align="middle">',
            imageUrl:
              "https://img.shop.com/Image/local/images/cc/mastercard.svg",
            categoryID: 1,
            cvv: 1,
            token: "51c4ade6-f659-11df-b64c-005056842e7d",
            accountName: "MC PO BOX TEST",
            mask: "589258******5892",
            expMonth: 5,
            expYear: 2026,
            addressId: 23207496,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223740?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223740/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223741,
            number: "378282*****0005",
            expires: "07/2026",
            type: "American Express",
            typeID: 1,
            html: '<img src="https://img.shop.com/Image/local/images/cc/amex.jpg" alt="American Express Cards" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/amex.svg",
            categoryID: 1,
            cvv: 1,
            token: "32ac68ae-f651-11df-b64c-005056842e7d",
            accountName: "amex test",
            mask: "378282*****0005",
            expMonth: 7,
            expYear: 2026,
            addressId: 23207497,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223741?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223741/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223764,
            number: "491891******5005",
            expires: "04/2027",
            type: "Visa",
            typeID: 9,
            html: '<img src="https://img.shop.com/Image/local/images/cc/visa.jpg" alt="Visa" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/visa.svg",
            categoryID: 1,
            cvv: 1,
            token: "8206a9b9-e8fd-11df-b64c-005056842e7d",
            accountName: "egift test",
            mask: "491891******5005",
            expMonth: 4,
            expYear: 2027,
            addressId: 23207780,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223764?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223764/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223778,
            number: "589258******5892",
            expires: "06/2026",
            type: "MasterCard",
            typeID: 6,
            html: '<img src="https://img.shop.com/Image/local/images/cc/mastercard.png" alt="MasterCard" align="middle">',
            imageUrl:
              "https://img.shop.com/Image/local/images/cc/mastercard.svg",
            categoryID: 1,
            cvv: 1,
            token: "51c4ade6-f659-11df-b64c-005056842e7d",
            accountName: "test AI-97101",
            mask: "589258******5892",
            expMonth: 6,
            expYear: 2026,
            addressId: 23207864,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223778?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223778/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223779,
            number: "378282*****0005",
            expires: "05/2026",
            type: "American Express",
            typeID: 1,
            html: '<img src="https://img.shop.com/Image/local/images/cc/amex.jpg" alt="American Express Cards" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/amex.svg",
            categoryID: 1,
            cvv: 1,
            token: "32ac68ae-f651-11df-b64c-005056842e7d",
            accountName: "AMEX AI-97101",
            mask: "378282*****0005",
            preferred: true,
            expMonth: 5,
            expYear: 2026,
            addressId: 23207865,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223779?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223779/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
          {
            id: 99223781,
            number: "491891******5005",
            expires: "04/2037",
            type: "Visa",
            typeID: 9,
            html: '<img src="https://img.shop.com/Image/local/images/cc/visa.jpg" alt="Visa" align="middle">',
            imageUrl: "https://img.shop.com/Image/local/images/cc/visa.svg",
            categoryID: 1,
            cvv: 1,
            token: "8206a9b9-e8fd-11df-b64c-005056842e7d",
            accountName: "visa save",
            mask: "491891******5005",
            expMonth: 4,
            expYear: 2037,
            addressId: 23207867,
            shopperAccountDisabled: 0,
            links: [
              {
                rel: "update",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223781?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "cvvCheck",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/99223781/cvv?siteId=0",
                type: "application/json; charset=UTF-8",
              },
              {
                rel: "addresses",
                href: "/Shopper/WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz/Wallet/Addresses?siteId=0",
                type: "application/json; charset=UTF-8",
              },
            ],
          },
        ]
          .map((item: any, index: number) => ({
            name: item.type,
            image: item.imageUrl,
            selected: item.preferred,
            index,
            size: 0,
            onChange: () => {},
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
          .sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0));

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
