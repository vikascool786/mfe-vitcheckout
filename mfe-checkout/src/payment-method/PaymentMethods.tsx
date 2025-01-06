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
import {
  PAYPAL,
  SEZZLE,
  CLICK2PAY,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import { loadScript } from "@paypal/paypal-js";
import {
  GET_PAYPAL_CLIENT_ID,
  GET_PAYPAL_RETURN_URL,
} from "../utils/urlResolver";
import { useApi } from "../hooks/useAPI";

const PAYPAL_TOKEN_URL = (shopperId: string) =>
  // make the return url and cancel url dynamic
  // TODO: PICK THIS UP FROM ENVIORNMENT VARIABLES
  `http://dev-services.shop.com:8085/ShoppingCart/Checkout/Paypal/${shopperId}/Token?creditFlow=false&hideShipping=false&markFlow=false&returnURL=${GET_PAYPAL_RETURN_URL()}&cancelURL=${GET_PAYPAL_RETURN_URL()}/checkout/v2/special&siteId=66`;

const staticPaymentMethods: IPaymentOptionProps[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions,
    selected: false,
    index: 0,
    size: 0,
    typeId: 1,
    visible: true,
    onChange: () => {},
  },
  {
    name: PAYPAL.name,
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    typeId: PAYPAL.typeId,
    siteFlagId: 393,
    visible: false,
    onChange: () => {},
  },
  {
    name: SEZZLE.name,
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    typeId: SEZZLE.typeId,
    siteFlagId: 568,
    visible: false,
    onChange: () => {},
  },
];

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
  siteId: string;
  pcid: string;
}

export const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  pcid,
}) => {
  const [allPaymentOptions, setAllPaymentOptions] =
    useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState(staticPaymentMethods);
  const [showClick2Pay, setShowClick2Pay] = useState(false);

  const [order, setOrder] = useAtom(orderAtom);
  const [paymentTypeId, setPaymentTypeId] = useState<number>(0);

  const { data: paypalToken } = useApi(PAYPAL_TOKEN_URL(shopperId), "GET");

  useEffect(() => {
    // Function to parse query parameters from the URL
    const getQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      return {
        token: params.get("token"),
        payerId: params.get("PayerID"),
      };
    };

    const { token, payerId } = getQueryParams();

    if (token && payerId) {
      console.log("PayPal Transaction Details:", { token, payerId });
      handlePaymentMethodChange(
        allPaymentOptions.findIndex((option) => option.name === PAYPAL.name)
      );
    }
  }, []);

  const confirmOrder = () => {
    if (order) {
      setOrder({
        ...order,
        orderId: 101,
      });
    }
  };
  useEffect(() => {
    const paymentSiteFlagList = thirdPartyPaymentFlagList.join(",");
    const fetchSiteFlagInfo = async () => {
      try {
        const response = await fetchSiteFlagData(siteId, paymentSiteFlagList);
        const updatedMethods = paymentMethods.map((method) => {
          const matchingResponse = response.find(
            (item: any) => item.flagID === method.siteFlagId
          );
          const c2pSiteflag = response.find(
            (item: any) => item.flagID === CLICK2PAY.siteflagTypeId
          );
          setShowClick2Pay(c2pSiteflag ? c2pSiteflag.active : false);

          return {
            ...method,
            visible: matchingResponse ? matchingResponse.active : false,
          };
        });

        setPaymentMethods(updatedMethods);
      } catch (error) {
        console.error("Failed to fetch siteflag data:", error);
      }
    };

    fetchSiteFlagInfo();
  }, []);

  const getUpdatedPaymentMethods = (
    shopperPayments: IPaymentOptionProps[],
    isExpanded: boolean
  ): IPaymentOptionProps[] => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const payerID = searchParams.get("PayerID");
    const isPayPalSuccess = payerID && token;

    if (isExpanded) {
      return [
        ...shopperPayments.map((item) => ({
          ...item,
          selected: isPayPalSuccess ? false : item.selected,
          visible: true,
        })),
        {
          ...staticPaymentMethods[1], // PayPal
          visible: true,
          selected: isPayPalSuccess, // Selected only if not a PayPal success
        },
        {
          ...staticPaymentMethods[2], // Sezzle
          visible: true,
        },
      ] as IPaymentOptionProps[];
    }

    const updatedOptions = [
      ...shopperPayments.map((item) => ({
        ...item,
        selected: isPayPalSuccess ? false : item.selected,
        visible: isPayPalSuccess ? false : item.selected,
      })),
      {
        ...staticPaymentMethods[1], // PayPal
        visible: true,
        selected: isPayPalSuccess, // Selected only if not a PayPal success
      },
      {
        ...staticPaymentMethods[2], // Sezzle
        visible: true,
      },
    ];

    return updatedOptions as IPaymentOptionProps[];
  };

  useEffect(() => {
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
            visible: item.preferred,
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
              address: addresses ? addresses[item.addressId] : ({} as Address),
            },
          }))
          .sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0));

        setAllPaymentOptions(
          getUpdatedPaymentMethods(shopperPayments, isExpanded)
        );
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    fetchShoppersSavedPayments(shopperId);
  }, [shopperId, addresses]);

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      handlePaymentMethodChange(-1);
      setPaymentTypeId(CLICK2PAY.typeId);
    };
    document.addEventListener(
      "c2pSelectedCard",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

  const handlePlaceOrder = async (paymentTypeId: number) => {
    switch (paymentTypeId) {
      case CLICK2PAY.typeId:
        handleClick2PayPlaceOrder();
        break;
      case SEZZLE.typeId:
        console.log("place order with Sezzle");
        break;
      case PAYPAL.typeId:
        // fetch paypal site flags
        const siteFlags = await fetchSiteFlagData(siteId, "393");
        const data = JSON.parse(siteFlags[0].auxDataText);

        // loading paypal sdk
        loadScript({
          clientId: GET_PAYPAL_CLIENT_ID(), // Your PayPal Client ID
          merchantId: data.merchantId, // Optional: Specify merchant ID
          environment: data.environment, // Use "sandbox" or "production"
          currency: "USD", // Set your currency
          intent: "capture", // "capture" for immediate payment
          components: "buttons",
        })
          .then((paypal) => {
            if (!paypal) {
              console.error("PayPal SDK failed to load correctly");
              return;
            }
            console.log("PayPal SDK loaded:", paypal);
          })
          .catch((error) => console.error("PayPal SDK failed to load", error));
        const url = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalToken.tokenId}`;
        window.open(url, "_self");
        break;
      default:
        console.log("place order with regular credit card");
        confirmOrder();
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
    const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(
      // @ts-ignore
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
    const isPaypal = allPaymentOptions.find(
      (option, index) => index === selectedIndex
    )?.name;

    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option, index) => ({
        ...option,
        selected: index === selectedIndex,
      }))
    );

    if (isPaypal === PAYPAL.name) {
      handlePlaceOrder(PAYPAL.typeId);
      return;
    }
    // Collapse any editing card when a new payment method is selected
    if (editingOptionIndex !== null && editingOptionIndex !== selectedIndex) {
      setEditingOptionIndex(null);
    }
  };

  // Toggle function for expanding or collapsing the card list
  const toggleAccordion = () => {
    setAllPaymentOptions(getUpdatedPaymentMethods(allPaymentOptions));
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
      visible: true,
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
          {allPaymentOptions
            .filter((method) => method.visible)
            .map((paymentOption, index) => (
              <PaymentOption
                key={
                  paymentOption.shopperSavedPayment?.id || paymentOption.name
                }
                {...{ ...paymentOption, index }}
                isEditing={editingOptionIndex === index}
                onEdit={() => setEditingOptionIndex(index)}
                onCancelEdit={() => setEditingOptionIndex(null)}
                onChange={() => handlePaymentMethodChange(index)}
                shopperId={shopperId}
              />
            ))}
          {showClick2Pay && <PaymentOptionClick2Pay pcid={pcid} />}
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
    </div>
  );
};
