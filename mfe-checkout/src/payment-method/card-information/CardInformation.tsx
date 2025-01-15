import { useAtom, useAtomValue } from "jotai";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { buildOrder } from "../../api/service/Order";
import {
  addShoppersPaymentMethod,
  addTempPaymentMethod,
  generateCardToken,
  updateShopperDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { AddressForm } from "../../component/AddressForm";
import { Button } from "../../component/Button/Button";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import {
  addressAtom,
  IPaymentOption,
  orderAtom,
  paymentMethodsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import "./CardInformation.scss";
import { on } from "events";

const DEBOUNCE_DELAY = 300;

const debouncedUpdate = debounce(
  (
    data: Partial<IPaymentMethod>,
    updateFunction: (data: Partial<IPaymentMethod>) => void
  ) => {
    updateFunction(data);
  },
  DEBOUNCE_DELAY
);

interface ICardInformationProps {
  paymentMethod: IPaymentMethod;
  address: Address;
  shopperId: string;
  onCancel: () => void;
}

export const CardInformation: React.FC<ICardInformationProps> = ({
  paymentMethod,
  shopperId,
  address,
  onCancel,
}) => {
  const [isCardSavedInWallet, setIsCardSavedInWallet] = useState(
    paymentMethod.id !== 0
  );

  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const addressList = useAtomValue(addressAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress = addressList.find((add) => add.isPrimary);
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);

  const [cardInformation, setCardInformation] = useState<{
    paymentMethod: IPaymentMethod;
    address: Address;
  }>({
    paymentMethod: { ...paymentMethod, cvv: "" },
    address,
  });
  const cardInformationRef = useRef(cardInformation.paymentMethod);

  useEffect(() => {
    cardInformationRef.current = cardInformation.paymentMethod;
  }, [cardInformation]);

  const handleInputChange = (
    field: keyof IPaymentMethod,
    value: string | number
  ) => {
    const updatedCardInformation = {
      ...cardInformationRef.current,
      [field]: value,
    };

    setCardInformation((prevState) => ({
      ...prevState,
      paymentMethod: {
        ...prevState,
        ...updatedCardInformation,
      },
    }));
  };

  const handleSaveCardInformation = async (type: "TEMP" | "WALLET") => {
    const { paymentMethod, address } = cardInformation;
    const requestData = {
      name: paymentMethod.accountName,
      number: paymentMethod.number,
      month: paymentMethod.expMonth,
      year: paymentMethod.expYear,
      preferred: paymentMethod.preferred,
      first: address.first,
      last: address.last,
      type: 9,
      address1: address.address1,
      address2: address.address2,
      city: address.city || "New York",
      state: address.state,
      zip: address.zip,
      country: address.country || "USA",
      phone: address.phone,
      isPoBox: address.isPoBox || false,
      cvv: paymentMethod.cvv,
    };

    try {
      if (type === "WALLET") {
        if (cardInformation.paymentMethod.id !== 0) {
          await updateShopperDetails(
            shopperId,
            cardInformation.paymentMethod.id,
            requestData
          );
          if (order && cardInformation.paymentMethod.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: cardInformation.paymentMethod.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder(orderResponse.response.success.data);
          }
          onCancel();
          return;
        }

        const response = await addShoppersPaymentMethod(shopperId, requestData);

        const updatedPaymentMethods = [
          ...paymentMethods,
          {
            paymentMethod: {
              ...response.at(-1),
              cvv: requestData.cvv,
            },
            paymentAddress: sameShippingAddress
              ? shippingAddress
              : ({} as Address),
            isSelected: true,
            isVisible: true,
          },
        ].filter((pm) => pm.paymentMethod?.id !== 0);

        setTimeout(
          () => setPaymentMethods(updatedPaymentMethods as IPaymentOption[]),
          300
        );

        onCancel();

        if (order && paymentMethod) {
          const updatedOrder = generateChangeStoreResponse({
            ...order,
            paymentMethod: {
              ...order.paymentMethod,
              id: response.at(-1)?.id as number,
            },
          });
          const orderResponse = await buildOrder(updatedOrder);
          setOrder(orderResponse.response.success.data);
        }
      } else if (type === "TEMP") {
        onCancel();
        const response = await addTempPaymentMethod(shopperId, requestData);

        if (response) {
          const updatedPaymentMethod = {
            ...response,
          };

          const updatedPaymentMethods = [
            ...paymentMethods,
            {
              paymentMethod: {
                ...updatedPaymentMethod,
                cvv: requestData.cvv,
              },
              paymentAddress: {} as Address,
              isSelected: true,
              isVisible: true,
            },
          ].filter((pm) => pm.paymentMethod.id !== 0);

          if (order && response.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: response.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder(orderResponse.response.success.data);
          }

          setTimeout(() => setPaymentMethods(updatedPaymentMethods));
        }
      }
    } catch (error) {
      console.error("Error saving card information:", error);
    }
  };

  const handleCancelNewCard = () => {
    const isCancelWhileAddingNewCard = cardInformation.paymentMethod.id === 0;

    if (!isCancelWhileAddingNewCard) return;

    setTimeout(() => {
      setPaymentMethods(
        paymentMethods
          .filter((paymentMethod) => paymentMethod.paymentMethod.id !== 0)
          .map((paymentOption) =>
            paymentOption.paymentMethod.preferred
              ? {
                ...paymentOption,
                isSelected: true,
              }
              : paymentOption
          )
      );
    }, 100);
  };

  const getYears = (startYear: number, endYear: number) =>
    Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: `${startYear + i}`,
      label: `${startYear + i}`,
    }));

  const currentYear = new Date().getFullYear();
  const years = getYears(currentYear, currentYear + 10);

  return (
    <div className="card-information-container">
      <FormField
        label="Name on Card"
        required
        value={cardInformation.paymentMethod.accountName || ""}
        onChange={(e) => handleInputChange("accountName", e.target.value)}
      />
      <FormField
        label="Card Number"
        required
        value={cardInformation.paymentMethod.number || ""}
        onChange={(e) => handleInputChange("number", e.target.value)}
      />
      <div className="form-field-container">
        <DropdownField
          label="Expiration Month"
          selectedValue={cardInformation.paymentMethod.expMonth?.toString()}
          options={[...Array(12)].map((_, i) => ({
            value: (i + 1).toString().padStart(2, "0"),
            label: (i + 1).toString().padStart(2, "0"),
          }))}
          onChange={(value) =>
            handleInputChange("expMonth", parseInt(value, 10))
          }
        />
        <DropdownField
          label="Expiration Year"
          selectedValue={cardInformation.paymentMethod.expYear?.toString()}
          options={years}
          onChange={(value) =>
            handleInputChange("expYear", parseInt(value, 10))
          }
        />
      </div>
      <FormField
        label="CVV"
        required
        value={cardInformation.paymentMethod.cvv}
        type="password"
        onChange={(e) => handleInputChange("cvv", e.target.value)}
      />
      <div className="save-for-later">
        <input
          type="checkbox"
          className="checkbox"
          checked={isCardSavedInWallet}
          onChange={(e) => setIsCardSavedInWallet(!isCardSavedInWallet)}
        />
        <span>Save card for later</span>
      </div>
      <div className="billing">
        <input
          type="checkbox"
          className="checkbox"
          checked={sameShippingAddress}
          onChange={() => setSameShippingAddress(!sameShippingAddress)}
        />
        <span>Same as shipping</span>
      </div>
      {!sameShippingAddress ? (
        <AddressForm
          shippingAddress={cardInformation.address}
          siteId="260"
          onAddressChange={(updatedAddress) => {
            setCardInformation((prevState) => ({
              ...prevState,
              address: updatedAddress,
            }));
          }}
        />
      ) : (
        <div className="checkbox-text">
          {shippingAddress?.first} {shippingAddress?.last}{" "}
          {shippingAddress?.address1}
          {shippingAddress?.address2} {shippingAddress?.city}{" "}
          {shippingAddress?.zip}
        </div>
      )}
      <div className="button-container">
        <Button
          btnType="secondary"
          label="Cancel"
          onClick={() => {
            onCancel();
            handleCancelNewCard();
          }}
        />
        <Button
          btnType="primary"
          label={isCardSavedInWallet ? "Update" : "Save"}
          onClick={() =>
            handleSaveCardInformation(isCardSavedInWallet ? "WALLET" : "TEMP")
          }
        />
      </div>
    </div>
  );
};
