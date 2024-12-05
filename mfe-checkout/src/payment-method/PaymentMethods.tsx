import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import { fetchShoppersPaymentMethods } from "../api/service/ShoppersPaymentMethods";
import { Add } from "../assets/icons/Add";
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
import {PaymentOptionClick2Pay} from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { useAtom } from "jotai";
import { checkoutData } from "../store";

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
  const [allPaymentOptions, setAllPaymentOptions] =
    useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkout] = useAtom(checkoutData);
  const { addresses } = useShopperEWalletAddresses(checkout?.shopperId || "");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchShoppersSavedPayments = async (shopperId: string) => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperId);

        const shopperPayments: IPaymentOptionProps[] = response
          .map((item: any, index: number) => {
            return {
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
                address: addresses
                  ? addresses[item.addressId]
                  : ({} as Address),
              },
            };
          })
          .sort(
            (a: { selected: boolean }, b: { selected: boolean }) =>
              (b.selected ? 1 : 0) - (a.selected ? 1 : 0)
          );
        updatePaymentOptions(shopperPayments);
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    const updatePaymentOptions = (shopperPayments: IPaymentOptionProps[]) => {
      const displayedOptions = [
        ...(shopperPayments && shopperPayments[0]
          ? [shopperPayments[0]]
          : [staticPaymentMethods[0]]),
        ...(isExpanded && shopperPayments ? shopperPayments.slice(1) : []),
        staticPaymentMethods?.[1] ?? [], // PayPal
        staticPaymentMethods?.[2] ?? [], // Sezzle
      ];

      setAllPaymentOptions(displayedOptions as IPaymentOptionProps[]);
      updatePaymentOptions(shopperPayments);
    };

    checkout?.shopperId && fetchShoppersSavedPayments(checkout.shopperId);
  }, [isExpanded, addresses, checkout]);

  const handlePaymentMethodChange = (selectedIndex: number) => {
    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option, index) => ({
        ...option,
        selected: index === selectedIndex,
      }))
    );
    // Collapse any editing card when a new payment method is selected
    if (editingOptionIndex !== null && editingOptionIndex !== selectedIndex) {
      setEditingOptionIndex(null);
    }
  };

  // Toggle function for expanding or collapsing the card list
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const onAddNewCard = async () => {
    const newCardIndex = allPaymentOptions.length;

    // Add a temporary entry for the new card in edit mode
    const newCard: IPaymentOptionProps = {
      name: "New Card",
      image: CardOptions, // Replace with a placeholder image or icon for new cards
      selected: false,
      index: newCardIndex,
      size: 0,
      onChange: () => {},
      isSavedCard: false,
      shopperSavedPayment: {
        id: 0, // Generate an ID if necessary
        expirationDate: "",
        cardMask: "",
        preferred: false,
        type: 9,
        accountName: "",
        image: CardOptions,
        address: {} as Address,
      },
    };

    setAllPaymentOptions((prevOptions) => [...prevOptions, newCard]);
    setEditingOptionIndex(newCardIndex);
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
              isEditing={editingOptionIndex === index}
              onEdit={() => setEditingOptionIndex(index)}
              onCancelEdit={() => setEditingOptionIndex(null)}
              onChange={() => handlePaymentMethodChange(index)}
            />
          ))}
         <PaymentOptionClick2Pay/>
          <div className="checkout-add-card" onClick={onAddNewCard}>
            <div className="checkout-add-card-text">
              <Add /> Add New Card
            </div>
            <div>
              <img src={CardOptions} />
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
