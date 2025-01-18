import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import { Back } from "../assets/svgs/Back";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { PaymentOption } from "../payment-method-option/PaymentMethodOption";
import {
  IPaymentOption,
  loadingAtom,
  orderAtom,
  paymentMethodsAtom,
} from "../store";
import { TextUpdates } from "../text-updates/TextUpdates";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import { SHOPPER_WALLET_ADDRESS, WALLET_DATA } from "../utils/MOCKS";
import "./PaymentMethods.scss";
import { CLICK2PAY, PAYPAL, thirdPartyPaymentFlagList } from "./PaymentType";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import {
  fetchShoppersPaymentMethods,
  generatePayPalTransactionDetails,
} from "../api/service/ShoppersPaymentMethods";
import withLoader from "../hoc/withLoader";

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
  siteId: string;
  pcid: string;
  updatePaymentTypeId: (newValue: number) => void;
}

const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  pcid,
  updatePaymentTypeId,
}) => {
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");

  const [showClick2Pay, setShowClick2Pay] = useState(false);

  const [order] = useAtom(orderAtom);

  const [showNewCard, setShowNewCard] = useState<boolean>(false);

  useEffect(() => {
    const paymentSiteFlagList = thirdPartyPaymentFlagList().join(",");
    const fetchSiteFlagInfo = async () => {
      try {
        const response = await fetchSiteFlagData(siteId, paymentSiteFlagList);
        paymentMethods.map((method) => {
          const c2pSiteflag = response.find(
            (item: any) => item.flagID === CLICK2PAY.siteflagTypeId
          );
          setShowClick2Pay(c2pSiteflag ? c2pSiteflag.active : false);
        });
      } catch (error) {
        console.error("Failed to fetch siteflag data:", error);
      }
    };

    fetchSiteFlagInfo();
  }, []);

  useEffect(() => {
    const fetchShoppersSavedPayments = async (
      shopperId: string,
      addresses: Address[]
    ) => {
      const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
          token: params.get("token"),
          payerId: params.get("PayerID"),
        };
      };

      const { token, payerId } = getQueryParams();

      const isPaypalOrderSuccess = token && payerId;
      const addressMap = new Map<string, Address>();

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );
      try {
        const response = await fetchShoppersPaymentMethods(shopperId);
        // const addressMap = addresses?.map()
        const paymentOptions = response.map(
          (paymentMethod) =>
          ({
            paymentMethod,
            paymentAddress: addressMap.get(
              paymentMethod.addressId.toString()
            ),
            isVisible: paymentMethod.preferred || false,
            isSelected: paymentMethod.preferred || false,
          } as IPaymentOption)
        );

        let updatedPaymentOptions = [...paymentOptions, ...paymentMethods];

        if (isPaypalOrderSuccess) {
          const paypalDetails = await generatePayPalTransactionDetails(
            shopperId,
            token,
            true,
            false
          );

          updatedPaymentOptions = updatedPaymentOptions.map((paymentOption) => {
            if (paymentOption.paymentMethod.typeID === PAYPAL.typeId) {
              return {
                ...paymentOption,
                isSelected: true,
              };
            } else {
              return {
                ...paymentOption,
                isSelected: false,
                isVisible: paymentOption.isVisible,
              };
            }
          });
        }
        setPaymentMethods(updatedPaymentOptions);
      } catch (error) {
        if (isPaypalOrderSuccess) {
          await generatePayPalTransactionDetails(shopperId, token, true, false);

          const updatedPaymentOptions = paymentMethods.map((paymentOption) => {
            if (paymentOption.paymentMethod.typeID === PAYPAL.typeId) {
              return {
                ...paymentOption,
                isSelected: true,
              };
            } else {
              return {
                ...paymentOption,
                isSelected: false,
                isVisible: paymentOption.isVisible,
              };
            }
          });

          setPaymentMethods(updatedPaymentOptions);
        }
      }
    };

    if (addresses) {
      fetchShoppersSavedPayments(shopperId, addresses);
    }
  }, [shopperId, addresses]);

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      setPaymentMethods(
        paymentMethods.map((item) => ({
          ...item,
          isSelected: false,
        }))
      );
      updatePaymentTypeId(CLICK2PAY.typeId);
    };
    document.addEventListener(
      "c2pSelectedCard",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

  const toggleAccordion = () => {
    // Find the selected payment method
    const selectedPaymentMethod = paymentMethods.find(
      (method) => method.isSelected
    );

    // Filter out the selected payment method from the rest of the list
    const otherPaymentMethods = paymentMethods.filter(
      (method) => !method.isSelected
    );

    if (isExpanded) {
      // Collapse: Only show preferred, PayPal, and Sezzle
      const updatedPaymentMethods = otherPaymentMethods.map(
        (paymentMethod) => ({
          ...paymentMethod,
          isVisible:
            paymentMethod.paymentMethod.preferred ||
            ["Paypal", "Sezzle"].includes(
              paymentMethod.paymentMethod.accountName
            ),
        })
      );

      setPaymentMethods([
        ...(selectedPaymentMethod ? [selectedPaymentMethod] : []),
        ...updatedPaymentMethods,
      ]);
    } else {
      // Expand: Show all items
      const updatedPaymentMethods = otherPaymentMethods.map(
        (paymentMethod) => ({
          ...paymentMethod,
          isVisible: true,
        })
      );

      setPaymentMethods([
        ...(selectedPaymentMethod ? [selectedPaymentMethod] : []),
        ...updatedPaymentMethods,
      ]);
    }

    // Toggle the state
    setIsExpanded(!isExpanded);
  };

  const onAddNewCard = () => {
    // Check if a card with id 0 is already present
    setShowNewCard(true);
    const hasTemporaryCard = paymentMethods.some(
      (paymentOption) => paymentOption.paymentMethod.id === 0
    );

    if (hasTemporaryCard) {
      // If a card with id 0 already exists, do not update payment methods
      console.warn("Temporary card already exists. Cannot add a new one.");
      return;
    }

    // Create the new card
    const newCard = createPaymentMethod({
      accountName: "",
      imageUrl: CardOptions,
      id: 0,
      typeID: 9,
      addressId: 0,
    });

    const updatedPaymentOptions = paymentMethods.map((paymentOption) => ({
      ...paymentOption,
      isSelected: false,
    }));

    setPaymentMethods([
      ...updatedPaymentOptions,
      {
        paymentMethod: newCard,
        paymentAddress: {} as Address,
        isPaymentValidated: false,
        isSelected: true,
        isVisible: true,
      },
    ]);
  };

  const removeCard = () => {
    setShowNewCard(false);
    const updatedPayments = paymentMethods
      .filter((pm) => pm.paymentMethod.id !== 0)
      .map((po) => {
        if (po.paymentMethod.preferred) {
          return { ...po, isSelected: true, isVisible: true };
        }

        return po;
      });

    setTimeout(() => {
      setPaymentMethods(updatedPayments);
    }, 300);
  };

  useEffect(() => {
    const isAddingNewCard = paymentMethods.find(
      (pm) => pm.paymentMethod.id === 0
    );
    setShowNewCard(isAddingNewCard ? true : false);
  }, [paymentMethods]);

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
          {paymentMethods.length >= 3 && (
            <div className="pm-show-card" onClick={toggleAccordion}>
              <div>{isExpanded ? "Hide other cards" : "See other cards"}</div>
              <Back className={`accordion ${isExpanded ? "open" : "close"}`} />
            </div>
          )}
        </div>
        <div className="pm-sub-container">
          {paymentMethods
            .filter((method) => method.isVisible)
            .map((paymentOption, index) => (
              <PaymentOption
                key={index}
                paymentOption={paymentOption}
                index={index}
                shopperId={shopperId}
                removeCard={removeCard}
              />
            ))}
          {showClick2Pay && (
            <PaymentOptionClick2Pay pcid={pcid} order={order} />
          )}
          {!showNewCard && (
            <div className="checkout-add-card" onClick={onAddNewCard}>
              <div className="checkout-add-card-text">
                <Add /> Add New Card
              </div>
              <div>
                <img src={CardOptions} />
              </div>
            </div>
          )}
        </div>
      </div>
      <TextUpdates />
    </div>
  );
};

export default withLoader(PaymentMethod);
