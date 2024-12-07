import $ from "jquery";
import "parsleyjs";
import React, { useRef, useState } from "react";
import { addShoppersPaymentMethod } from "../../api/service/ShoppersPaymentMethods";
import { AddressForm } from "../../component/AddressForm";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { ShopperSavedPayments } from "../../interfaces/ShopperSavedPayments";
import "./CardInformation.scss";

interface ICardInformationProps {
  initialData?: Partial<ShopperSavedPayments>;
  onCancel?: () => void;
  shopperId: string;
}

/**
 * const requestData = {
  name: "Am",
  token: "8206a9b9-e8fd-11df-b64c-005056842e7d",
  number: "4111111111111111",
  month: 7,
  year: 2033,
  type: 9,
  preferred: true,
  first: "vikas",
  last: "w",
  address1: "NY",
  city: "New York",
  country: "USA",
  zip: "10001",
  state: "New York",
  isPoBox: false,
};
 */

const defaultAddress: Address = {
  id: 0,
  isPrimary: 0,
  first: "",
  last: "",
  address1: "",
  address2: "",
  zip: "",
  city: "",
  state: "",
  phone: "",
} as Address;

export const CardInformation: React.FC<ICardInformationProps> = ({
  initialData,
  shopperId,
}) => {
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);
  const [address, setAddress] = useState<Address>(
    initialData?.address || defaultAddress
  );
  const [saveAddress, setSaveAddress] = useState<boolean>(false);
  const [cardInformation, setCardInformation] = useState<ShopperSavedPayments>({
    accountName: initialData?.accountName || "",
    address: initialData?.address || defaultAddress,
    cardMask: initialData?.cardMask || "",
    expirationDate: initialData?.expirationDate || "",
    id: initialData?.id || 0,
    image: initialData?.image || "",
    preferred: initialData?.preferred || false,
    type: 9,
  });

  const cardInformationRef = useRef(cardInformation);

  const handleInputChange = (field: keyof ShopperSavedPayments, value: any) => {
    // Update the ref value directly
    cardInformationRef.current = {
      ...cardInformationRef.current,
      [field]: value,
    };
    // Trigger a re-render by setting the state with the updated ref
    setCardInformation({ ...cardInformationRef.current });
  };

  const handleSaveAddress = async () => {
    console.log(cardInformation.expirationDate);
    const expirationMonth = cardInformation.expirationDate?.slice(0, 2);
    const expirationYear = cardInformation.expirationDate?.slice(-4);

    const requestData = {
      name: cardInformation.accountName,
      number: cardInformation.cardMask,
      month: expirationMonth ? parseInt(expirationMonth, 10) : undefined,
      year: expirationYear ? parseInt(expirationYear, 10) : undefined,
      type: cardInformation.type,
      preferred: cardInformation.preferred,
      first: address.first,
      last: address.last,
      address1: address.address1,
      address2: address.address2,
      city: "New York",
      state: address.state,
      zip: address.zip,
      country: "USA", // Replace with dynamic data if available
      phone: address.phone,
      isPoBox: address.isPoBox || false,
    };

    try {
      await addShoppersPaymentMethod(shopperId, requestData);
      console.log("Card information successfully saved.");
    } catch (error) {
      console.error("Unable to save card information:", error);
    }
  };

  const validateFormFields = () => {
    const form = document.querySelector(
      ".card-information-container"
    ) as HTMLElement;
    $(form).parsley().validate();
    return $(form).parsley().isValid();
  };

  const getYears = (startYear: number, endYear: number) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        value: year.toString(),
        label: year.toString(),
      });
    }
    return years;
  };

  const currentYear = new Date().getFullYear();
  const years = getYears(currentYear, currentYear + 10);

  return (
    <div className="card-information-container">
      <FormField
        label="Name on Card"
        required
        data-parsley-required="true"
        value={cardInformation.accountName || ""}
        onChange={(e) => handleInputChange("accountName", e.target.value)}
      />
      <FormField
        label="Card Number"
        required
        data-parsley-required="true"
        value={cardInformation.cardMask || ""}
        onChange={(e) => handleInputChange("cardMask", e.target.value)}
      />
      <div className="form-field-container">
        <DropdownField
          label="Expiration Month"
          selectedValue={cardInformation.expirationDate?.slice(0, 2) || ""}
          options={[
            { value: "01", label: "01" },
            { value: "02", label: "02" },
            { value: "03", label: "03" },
            { value: "04", label: "04" },
            { value: "05", label: "05" },
            { value: "06", label: "06" },
            { value: "07", label: "07" },
            { value: "08", label: "08" },
            { value: "09", label: "09" },
            { value: "10", label: "10" },
            { value: "11", label: "11" },
            { value: "12", label: "12" },
          ]}
          onChange={(value) =>
            setCardInformation((prev) => ({
              ...prev,
              expirationDate: `${value}/${cardInformation.expirationDate?.slice(
                -4
              )}`,
            }))
          }
        />
        <DropdownField
          label="Expiration Year"
          selectedValue={cardInformation.expirationDate?.slice(-4) || ""}
          options={years}
          onChange={(value) =>
            setCardInformation((prev) => ({
              ...prev,
              expirationDate: `${cardInformation.expirationDate?.slice(
                0,
                2
              )}/${value}`,
            }))
          }
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="CVV"
          required
          extraLabel="3 or 4 digits"
          maxLength={4}
          // onChange={(e) => handleInputChange("cvv", e.target.value)}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            checked={saveAddress}
            onChange={handleSaveAddress}
          />
          <span className="shipping-text">Save card for later</span>
        </div>
      </div>
      <div className="billing">
        <div className="billing-address">
          Billing Address
          <input
            className="checkbox"
            type="checkbox"
            checked={sameShippingAddress}
            onChange={() => setSameShippingAddress(!sameShippingAddress)}
          />
        </div>
        <span className="shipping-text">Same as shipping</span>
      </div>
      {!sameShippingAddress ? (
        <AddressForm
          shippingAddress={address}
          siteId="260"
          onAddressChange={(updatedAddress: Address) => {
            setAddress(updatedAddress);
            setCardInformation((prev) => ({
              ...prev,
              address: updatedAddress,
            }));
          }}
        />
      ) : (
        <div className="checkbox-text">
          Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430
        </div>
      )}
    </div>
  );
};
