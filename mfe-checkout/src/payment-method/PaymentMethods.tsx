import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import {
  addTempPaymentMethod,
  fetchShoppersPaymentMethods,
} from "../api/service/ShoppersPaymentMethods";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Back } from "../assets/svgs/Back";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import {
  IPaymentOptionProps,
  PaymentOption,
} from "../payment-method-option/PaymentMethodOption";
import { TextUpdates } from "../text-updates/TextUpdates";
import "./PaymentMethods.scss";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { updatePaymentMethod } from "../utils/OrderUtils";
import { changeOrder, commitOrder } from "../api/service/Order";
import Click2PayUtil from "../payment-method-click2pay/Click2PayUtil";
import Click2PayPlaceOrder from "../payment-method-click2pay/Click2PayPlaceOrder";
import { getTransactionData } from "../api/service/Click2PayTransaction";
import { useAtom } from "jotai";
import { orderAtom } from "../store";

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
    onChange: () => {},
  },
  {
    name: "PayPal",
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    typeId: PAYMENT_TYPE_ID_PAYPAL,
    onChange: () => {},
  },
  {
    name: "Sezzle",
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    typeId: PAYMENT_TYPE_ID_SEZZLE,
    onChange: () => {},
  },
];

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
}

export const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
}) => {
  const [allPaymentOptions, setAllPaymentOptions] =
    useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );

  const [order, setOrder] = useAtom(orderAtom);

  const confirmOrder = () => {
    if (order) {
      setOrder({
        ...order,
        orderId: 101,
      });
    }
  };
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

    fetchShoppersSavedPayments(shopperId);
  }, [isExpanded, addresses, shopperId]);

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      handlePaymentMethodChange(-1);
    };
    document.addEventListener(
      "deselectPaymentMethods",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

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

  const getClickToPayTransactionData = async (
    flowId: string,
    transId: string,
    total: string
  ) => {
    try {
      const response = await getTransactionData(flowId, transId, total);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleClick2PayPlaceOrder = () => {
    console.log("place order with click 2 pay");
    const digitalCardId = Click2PayPlaceOrder.getDigitalCardId();
    // @ts-ignore
    const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(
      window.c2pInstance,
      digitalCardId
    );
    c2pPlaceOrderPromise
      .then((response: any) => {
        if (response.checkoutActionCode === "COMPLETE") {
          const transId = response.headers["merchant-transaction-id"];
          const flowId = response.headers["x-src-cx-flow-id"];
          const total = Click2PayUtil.getC2pData().transactionAmount;
          const promiseClick2PayTransData = getClickToPayTransactionData(
            flowId,
            transId,
            total
          );
          promiseClick2PayTransData.then((response: any) => {
            const paymentMethodResponse = response.data.paymentMethod;
            //use response to create a temp payment id
            const walletData = {
              name: paymentMethodResponse.accountName,
              number: paymentMethodResponse.number,
              token: paymentMethodResponse.token,
              month: paymentMethodResponse.expMonth,
              year: paymentMethodResponse.expYear,
              type: paymentMethodResponse.typeID,
            };
            const promiseTempPayment = addTempPaymentMethod(
              shopperId,
              walletData
            );
            promiseTempPayment.then((response: any) => {
              const paymentId = response.data.id;
              if (order) {
                let changeOrderPayload = generateChangeStoreResponse(order);
                changeOrderPayload = updatePaymentMethod(
                  changeOrderPayload,
                  paymentId
                );
                const changeOrderPromise = changeOrder(
                  changeOrderPayload,
                  cartId
                );
                changeOrderPromise.then((response: any) => {
                  //place the order
                  const promiseCommitOrder = commitOrder(cartId);
                  promiseCommitOrder.then((response: any) => {
                    const orderId = response.data.response.success.data.orderId;
                    window.location.href = `/nbts/orderconfirmation-${orderId}`;
                  });
                });
              }
            });
          });
        }
      })
      .catch((error: { message: string }) => {
        console.log("c2p place order failed: " + error.message);
      });
  };

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
      typeId: 9,
      shopperId: "",
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
        <Button label="Place Order" type="primary" onClick={confirmOrder} />
      </div>
    </div>
  );
};
