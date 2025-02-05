import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import {
  fetchShoppersPaymentMethods,
  generatePayPalTransactionDetails,
} from "../api/service/ShoppersPaymentMethods";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import { Back } from "../assets/svgs/Back";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import withLoader from "../hoc/withLoader";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { PaymentOption } from "../payment-method-option/PaymentMethodOption";
import { IPaymentOption, orderAtom, paymentMethodsAtom } from "../store";
import { TextUpdates } from "../text-updates/TextUpdates";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import "./PaymentMethods.scss";
import {
  CLICK2PAY,
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { WALLET_DATA } from "../utils/MOCKS";

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

      // checking paypal order success 
      const { token, payerId } = getQueryParams();
      const isPaypalOrderSuccess = token && payerId;

      const addressMap = new Map<string, Address>();

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );
      try {
        // const response = await fetchShoppersPaymentMethods(shopperId);
        const response = WALLET_DATA;

        const paymentOptions = response.map((paymentMethod) => {
          const isOrderPaymentMethod =
            paymentMethod.id === order?.paymentMethod?.id;

          // Handle single response case
          if (response.length === 1) {
            return {
              paymentMethod,
              paymentAddress: addressMap.get(
                paymentMethod.addressId.toString()
              ),
              isVisible: true,
              isSelected: true,
            } as IPaymentOption;
          }

          // Handle multiple response case
          return {
            paymentMethod,
            paymentAddress: addressMap.get(paymentMethod.addressId.toString()),
            isVisible: isOrderPaymentMethod || paymentMethod.preferred,
            isSelected: isOrderPaymentMethod || paymentMethod.preferred,
          } as IPaymentOption;
        });

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

    // while adding new card makeing new credit card as selected 
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
        isEditing: true,
      },
    ]);
  };

  // checking new add is adding or not
  useEffect(() => {
    const isAddingNewCard = paymentMethods.find(
      (pm) => pm.paymentMethod.id === 0
    );
    setShowNewCard(isAddingNewCard ? true : false);
  }, [paymentMethods]);

  const isMethodDefault = (option: IPaymentOption) => {
    const { accountName, preferred } = option.paymentMethod;
    if (accountName === PAYPAL.name || accountName === SEZZLE.name) {
      return true;
    }

    if (preferred) return preferred;

    return false;
  };

  const onCardEdit = (paymentId: number) => {
    // Update payment methods with the editing state

    const updatedPaymentMethods = paymentMethods.map((method) =>
      method.paymentMethod.id === paymentId
        ? {
          ...method,
          isEditing: !method.isEditing, // Toggle editing state for the selected payment method
        }
        : {
          ...method,
          isEditing: false,
          isVisible: isMethodDefault(method), // Ensure other methods are not in editing mode
        }
    );

    setTimeout(() => {
      setPaymentMethods(updatedPaymentMethods);
    }, 300);
  };

  const handleCancelNewCard = () => {
    setShowNewCard(false);
    const updatedPayments = paymentMethods
      .filter((pm) => pm.paymentMethod.id !== 0)
      .map((po) => {
        if (po.paymentMethod.preferred) {
          return {
            ...po,
            isSelected: true,
            isEditing: false,
          };
        }
        return { ...po, isEditing: false };
      });

    setTimeout(() => {
      setPaymentMethods(updatedPayments);
    }, 300);
  };

  const onAddNewCards = (payments: IPaymentOption[]) => {
    setTimeout(() => {
      setPaymentMethods(payments);
    }, 1000);
  };

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
          {paymentMethods.length >= 4 && (
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
                onCardEdit={onCardEdit}
                handleCancelNewCard={handleCancelNewCard}
                onAddNewCards={onAddNewCards}
                updatePaymentTypeId={updatePaymentTypeId}
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
