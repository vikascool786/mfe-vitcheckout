import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import {
  addShoppersPaymentMethod,
  updateShopperDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { AddressForm } from "../../component/AddressForm";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import { addressAtom, orderAtom, paymentMethodsAtom } from "../../store";
import { Button } from "../../component/Button/Button";
import { buildOrder } from "../../api/service/Order";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import "./CardInformation.scss";

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
  onCancel: () => void;
}

export const CardInformation: React.FC<ICardInformationProps> = ({
  paymentMethod,
  address,
  onCancel,
}) => {
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const addressList = useAtomValue(addressAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress = addressList.find((add) => add.isPrimary);
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);

  const [cardInformation, setCardInformation] = useState(paymentMethod);
  const cardInformationRef = useRef(cardInformation);

  useEffect(() => {
    cardInformationRef.current = cardInformation;
  }, [cardInformation]);

  const updateCardInformation = (data: Partial<IPaymentMethod>) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((method) =>
        method.paymentMethod.id === paymentMethod.id
          ? { ...method, ...data }
          : method
      )
    );
  };

  const handleInputChange = (
    field: keyof IPaymentMethod,
    value: string | number
  ) => {
    const updatedCardInformation = {
      ...cardInformationRef.current,
      [field]: value,
    };
    setCardInformation(updatedCardInformation);
  };

  const handleSaveCardInformation = async (type: "TEMP" | "WALLET") => {
    const requestData = {
      name: cardInformation.accountName,
      number: cardInformation.number,
      month: cardInformation.expMonth,
      year: cardInformation.expYear,
      type: cardInformation.type,
      preferred: cardInformation.preferred,
      first: address.first,
      last: address.last,
      address1: address.address1,
      address2: address.address2,
      city: address.city || "New York",
      state: address.state,
      zip: address.zip,
      country: address.country || "USA",
      phone: address.phone,
      isPoBox: address.isPoBox || false,
      cvv: cardInformation.cvv,
    };

    try {
      if (type === "WALLET") {
        const response = await addShoppersPaymentMethod("shopperId", {
          ...requestData,
        });
        const paymentMethod = response.find((pm) => pm.preferred);
        if (order && paymentMethod) {
          const updatedOrder = generateChangeStoreResponse({
            ...order,
            paymentMethod: { ...order.paymentMethod, id: paymentMethod.id },
          });
          const orderResponse = await buildOrder(updatedOrder);
          setOrder(orderResponse.response.success.data);
        }
      }
    } catch (error) {
      console.error("Error saving card information:", error);
    }
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
        value={cardInformation.accountName || ""}
        onChange={(e) => handleInputChange("accountName", e.target.value)}
      />
      <FormField
        label="Card Number"
        required
        value={cardInformation.number || ""}
        onChange={(e) => handleInputChange("number", e.target.value)}
      />
      <div className="form-field-container">
        <DropdownField
          label="Expiration Month"
          selectedValue={cardInformation.expMonth?.toString()}
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
          selectedValue={cardInformation.expYear?.toString()}
          options={years}
          onChange={(value) =>
            handleInputChange("expYear", parseInt(value, 10))
          }
        />
      </div>
      <FormField
        label="CVV"
        required
        value={cardInformation.cvv || ""}
        onChange={(e) => handleInputChange("cvv", e.target.value)}
      />
      <div className="save-for-later">
        <input
          type="checkbox"
          checked={!!cardInformation.preferred}
          onChange={(e) =>
            handleInputChange("preferred", e.target.checked ? 1 : 0)
          }
        />
        <span>Save card for later</span>
      </div>
      <div className="billing">
        <input
          type="checkbox"
          checked={sameShippingAddress}
          onChange={() => setSameShippingAddress(!sameShippingAddress)}
        />
        <span>Same as shipping</span>
      </div>
      {!sameShippingAddress && (
        <AddressForm
          shippingAddress={address}
          siteId="260"
          onAddressChange={(updatedAddress) => {
            // setCardInformation(prevState => ({
            //   ...prevState,
            console.log(updatedAddress);
          }}
        />
      )}
      <div className="button-container">
        <Button btnType="secondary" label="Cancel" onClick={onCancel} />
        <Button
          btnType="primary"
          label="Save"
          onClick={() => handleSaveCardInformation("WALLET")}
        />
      </div>
    </div>
  );
};
