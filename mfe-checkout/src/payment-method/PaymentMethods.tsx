import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import { fetchShoppersPaymentMethods } from "../api/service/ShoppersPaymentMethods";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Back } from "../assets/svgs/Back";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import {
  IPaymentOptionProps,
  PaymentOption,
} from "../payment-method-option/PaymentMethodOption";
import { TextUpdates } from "../text-updates/TextUpdates";
import "./PaymentMethods.scss";
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import {
  CLICK2PAY,
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { changeOrder } from "../api/service/Order";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";

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
  updatePaymentTypeId: (newValue: number) => void;
}

export const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  pcid,
  updatePaymentTypeId,
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
    const isPayPalSuccess = !!payerID && !!token;

    const hasPayPal = shopperPayments.some((item) => item.name === PAYPAL.name);
    const hasSezzle = shopperPayments.some((item) => item.name === SEZZLE.name);

    const additionalMethods = [
      ...(hasPayPal
        ? []
        : [
            {
              ...staticPaymentMethods[1],
              visible: true,
              selected: isPayPalSuccess,
            },
          ]), // Add PayPal if missing
      ...(hasSezzle ? [] : [{ ...staticPaymentMethods[2], visible: true }]), // Add Sezzle if missing
    ];

    if (isExpanded) {
      // Show all cards and ensure PayPal and Sezzle are included
      return [...shopperPayments, ...additionalMethods].map((item) => ({
        ...item,
        visible: true,
      }));
    }

    // In collapsed view, set only the selected card as visible along with PayPal and Sezzle

    return [
      ...shopperPayments.map((item) => ({
        ...item,
        visible:
          item.selected ||
          item.name === "Paypal" ||
          item.name === "Sezzle" ||
          false,
      })),
      ...additionalMethods.map((item) => ({
        ...item,
        visible: true,
      })),
    ];
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
        setAllPaymentOptions(getUpdatedPaymentMethods([], isExpanded));
      }
    };

    fetchShoppersSavedPayments(shopperId);
  }, [shopperId, addresses]);

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      handlePaymentMethodChange(-1);
      updatePaymentTypeId(CLICK2PAY.typeId);
    };
    document.addEventListener(
      "c2pSelectedCard",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

  const handlePaymentMethodChange = (selectedIndex: number) => {
    const isPaypal = allPaymentOptions
      .filter((option) => option.visible)
      .find((option, index) => index === selectedIndex)?.name;

    setAllPaymentOptions((prevOptions) =>
      prevOptions
        .filter((option) => option.visible)
        .map((option, index) => ({
          ...option,
          selected: index === selectedIndex,
        }))
    );

    const option = allPaymentOptions.filter((option) => option.visible)[
      selectedIndex
    ];

    if (option) {
      changeOrder(
        generateChangeStoreResponse({
          ...order,
          paymentMethod: {
            ...option.shopperSavedPayment,
          },
        }),
        order?.id
      );
    }

    if (isPaypal === PAYPAL.name) {
      updatePaymentTypeId(PAYPAL.typeId);
    }
    // Collapse any editing card when a new payment method is selected
    if (editingOptionIndex !== null && editingOptionIndex !== selectedIndex) {
      setEditingOptionIndex(null);
    }
  };

  // Toggle function for expanding or collapsing the card list
  const toggleAccordion = () => {
    console.log(getUpdatedPaymentMethods(allPaymentOptions, !isExpanded));
    setAllPaymentOptions((prevMethods) =>
      getUpdatedPaymentMethods(prevMethods, !isExpanded)
    );
    setIsExpanded(!isExpanded);
  };

  const onAddNewCard = async () => {
    // Create the new card
    const newCard: IPaymentOptionProps = {
      name: "New Card",
      image: CardOptions,
      selected: true, // Set the new card as selected
      index: allPaymentOptions.length, // Use current length as new index
      size: 0,
      onChange: () => {},
      isSavedCard: false, // Indicate that it's a new card
      typeId: 9,
      visible: true,
      shopperId: "",
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

    // Deselect other cards and update the payment options
    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        selected: false, // Deselect existing cards
      }))
    );

    // Add the new card after the previous state update completes
    setTimeout(() => {
      setAllPaymentOptions((prevOptions) => [...prevOptions, newCard]);
      setEditingOptionIndex(
        allPaymentOptions.filter((option) => option.visible).length
      ); // Set editing index safely
    }, 0);
  };

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
          {allPaymentOptions.length >= 3 && (
            <div className="pm-show-card" onClick={toggleAccordion}>
              <div>{isExpanded ? "Hide other cards" : "See other cards"}</div>
              <Back className={`accordion ${isExpanded ? "open" : "close"}`} />
            </div>
          )}
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
                onCancelEdit={() => {
                  // set the selected card back to the original card
                  // if it is an new card, remove that from the list
                  const updatedOptions = allPaymentOptions.filter(
                    (option, i) => option.name !== "New Card"
                  );

                  setAllPaymentOptions(updatedOptions);

                  setEditingOptionIndex(null);
                }}
                onSaveTempCard={(card) => {
                  const newOptions = [
                    ...allPaymentOptions,
                    {
                      ...card,
                      name: card.accountName,
                      index: allPaymentOptions.length,
                      isSavedCard: false,
                      image:
                        "https://img.shop.com/Image/local/images/cc/visa.jpg",
                      shopperSavedPayment: card,
                      selected: true,
                      visible: true,
                    },
                  ];

                  setAllPaymentOptions(
                    newOptions.filter((option) => option.name !== "New Card")
                  );
                }}
                onChange={() => handlePaymentMethodChange(index)}
                shopperId={shopperId}
              />
            ))}
          {showClick2Pay && (
            <PaymentOptionClick2Pay pcid={pcid} order={order} />
          )}
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
