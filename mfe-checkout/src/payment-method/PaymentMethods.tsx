import React, { useEffect, useMemo, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import { fetchShoppersPaymentMethods } from "../api/service/ShoppersPaymentMethods";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
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
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { useAtom } from "jotai";
import Click2PayPlaceOrder from "../payment-method-click2pay/Click2PayPlaceOrder";
import { getTransactionData } from "../api/service/Click2PayTransaction";
import Click2PayUtil from "../payment-method-click2pay/Click2PayUtil";

const PAYMENT_TYPE_ID_CLICK2PAY = 60;
const PAYMENT_TYPE_ID_SEZZLE = 56;
const PAYMENT_TYPE_ID_PAYPAL = 48;

const staticPaymentMethods: IPaymentOptionProps[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions,
    selected: false,
    index: 0,
    size: 0,
    typeId: 1,
    onChange: () => { },
  },
  {
    name: "PayPal",
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    typeId: PAYMENT_TYPE_ID_PAYPAL,
    onChange: () => { },
  },
  {
    name: "Sezzle",
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    typeId: PAYMENT_TYPE_ID_SEZZLE,
    onChange: () => { },
  },
];
interface IPaymentMethod {
  shopperId: string;
}

export const PaymentMethod: React.FC<IPaymentMethod> = ({ shopperId }) => {
  const [allPaymentOptions, setAllPaymentOptions] =
    useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );
  const [paymentTypeId, setPaymentTypeId] = useState<number>(0);

  // Memoize fetched addresses to prevent unnecessary updates
  const memoizedAddresses = useMemo(() => addresses || {}, [addresses]);

  const fetchShoppersSavedPayments = async (shopperId: string) => {
    try {
      const response = await fetchShoppersPaymentMethods(shopperId);

      const shopperPayments: IPaymentOptionProps[] = response
        .map((item: any, index: number) => ({
          name: item.type,
          image: item.imageUrl,
          selected: item.preferred,
          index,
          size: 0,
          typeId: item.typeID,
          onChange: () => { },
          isSavedCard: true,
          shopperSavedPayment: {
            id: item.id,
            expirationDate: item.expires || "",
            cardMask: item.mask || "",
            preferred: item.preferred,
            type: item.type,
            accountName: item.accountName || "",
            name: item.type,
            image: item.imageUrl,
            address: memoizedAddresses[item.addressId] || ({} as Address),
          },
        }))
        .sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0));
      updatePaymentOptions(shopperPayments);
    } catch (error) {
      console.error("Failed to fetch shopper payment data:", error);
    }
  };

  const updatePaymentOptions = (shopperPayments: IPaymentOptionProps[]) => {
    const displayedOptions = [
      ...(shopperPayments?.[0]
        ? [shopperPayments[0]]
        : [staticPaymentMethods[0]]),
      ...(isExpanded ? shopperPayments.slice(1) : []),
      staticPaymentMethods?.[1] || [],
      staticPaymentMethods?.[2] || [],
    ];
    setAllPaymentOptions(displayedOptions as IPaymentOptionProps[]);
    updateSelectedPaymentType(displayedOptions);
    updatePaymentOptions(shopperPayments);
  };

  useEffect(() => {
    if (shopperId) {
      fetchShoppersSavedPayments(shopperId);
    }
  }, [shopperId, isExpanded, memoizedAddresses]);

  useEffect(() => {
    const handleC2PSelectedCardEvent = () => {
      //deselect radio buttons from other payment methods
      handlePaymentMethodChange(-1);
      setPaymentTypeId(PAYMENT_TYPE_ID_CLICK2PAY);
    };
    document.addEventListener('c2pSelectedCard', handleC2PSelectedCardEvent);

  }, []);

  const handlePaymentMethodChange = (selectedIndex: number) => {
    const updatedPaymentMethods = allPaymentOptions.map((option, index) => ({
      ...option,
      selected: index === selectedIndex,
    }));
    setAllPaymentOptions(updatedPaymentMethods);
    // Collapse any editing card when a new payment method is selected
    if (editingOptionIndex !== null && editingOptionIndex !== selectedIndex) {
      setEditingOptionIndex(null);
    }
    updateSelectedPaymentType(updatedPaymentMethods);
  };


  function updateSelectedPaymentType(paymentOptions: any[]) {
    const selectedPayment = paymentOptions.find(option => option.selected);
    const selectedTypeId = selectedPayment ? selectedPayment.typeId : null;
    setPaymentTypeId(selectedTypeId);
  }

  const toggleAccordion = () => {
    setIsExpanded((prev) => !prev);
  };

  const onAddNewCard = () => {
    const newCardIndex = allPaymentOptions.length;
    const newCard: IPaymentOptionProps = {
      name: "New Card",
      image: CardOptions,
      selected: false,
      index: newCardIndex,
      size: 0,
      typeId: 0,
      onChange: () => { },
      isSavedCard: false,
      shopperSavedPayment: {
        id: 0,
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

  const handlePlaceOrder = (paymentTypeId: number) => {
    switch (paymentTypeId) {
      case PAYMENT_TYPE_ID_CLICK2PAY:
        handleClick2PayPlaceOrder();
        break;
      case PAYMENT_TYPE_ID_SEZZLE:
        console.log("place order with Sezzle");
        break;
      case PAYMENT_TYPE_ID_PAYPAL:
        console.log("place order with PayPal");
        break;
      default:
        console.log("place order with regular credit card");
        break;
    }
  };

  const handleClick2PayPlaceOrder = () => {
    console.log("place order with click 2 pay");
    const digitalCardId = Click2PayPlaceOrder.getDigitalCardId();
    // @ts-ignore
    const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(window.c2pInstance, digitalCardId);
    c2pPlaceOrderPromise
      .then((response: any) => {
        if (response.checkoutActionCode === 'COMPLETE') {
          const transId = response.headers['merchant-transaction-id'];
          const flowId = response.headers['x-src-cx-flow-id'];
          const total = Click2PayUtil.getC2pData().transactionAmount;
          const promiseClick2PayTransData = getClickToPayTransactionData(flowId, transId, total);
          promiseClick2PayTransData.then((response: any) => {
            console.log("promiseClick2PayTransData response: " + JSON.stringify(response));
            //use response to create a temp payment id
            //once we have the temp payment id need to update the order and place (commit)
          })
        }
      })
      .catch((error: { message: string; }) => {
        console.log("c2p place order failed: " + error.message);
      })
  }

  const getClickToPayTransactionData = async (flowId: string, transId: string, total: string) => {
    try {
      const response = await getTransactionData(flowId, transId, total);
      return new Promise((resolve) => {
        resolve(response);
      })
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
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
              shopperId={shopperId}
            />
          ))}
          <PaymentOptionClick2Pay />
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
        <Button onClick={() => handlePlaceOrder(paymentTypeId)} label="Place Order" type="primary" />
      </div>
    </div>
  );
};
