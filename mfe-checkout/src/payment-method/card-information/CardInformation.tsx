import React, { useState, useRef } from "react";
import $ from "jquery";
import "parsleyjs";
import { FormField } from "../../component/Form/Field/FormField";
import { ShopperSavedPayments } from "../../interfaces/ShopperSavedPayments";
import "./CardInformation.scss";
import { AddressForm } from "../../component/AddressForm";
import { Address } from "../../interfaces/Address";

interface ICardInformationProps {
  initialData?: Partial<ShopperSavedPayments>;
  onCancel?: () => void;
}

const defaultAddress: Address = {
  id: 0,
  isPrimary: true,
  first: "",
  last: "",
  address1: "",
  address2: "",
  zip: "",
  city: "",
  state: "",
  phone: "",
};

export const CardInformation: React.FC<ICardInformationProps> = ({
  initialData,
  onCancel,
}) => {
  console.log(initialData)
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);
  const [address, setAddress] = useState<Address>(defaultAddress);
  const [saveAddress, setSaveAddress] = useState<boolean>(false);
  const [cardInformation, setCardInformation] = useState<ShopperSavedPayments>({
    accountName: initialData?.accountName || "",
    address: initialData?.address || defaultAddress,
    cardMask: initialData?.cardMask || "",
    expirationDate: initialData?.expirationDate || "",
    id: initialData?.id || 0,
    image: initialData?.image || "",
    preferred: initialData?.preferred || false,
    type: initialData?.type || "",
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

  const handleSaveAddress = () => {
    const isValid = validateFormFields();
    if (isValid) {
      setSaveAddress(!saveAddress);
    } else {
      setSaveAddress(false);
    }
  };

  const validateFormFields = () => {
    const form = document.querySelector(
      ".card-information-container"
    ) as HTMLElement;
    $(form).parsley().validate();
    return $(form).parsley().isValid();
  };

  console.log(cardInformation)

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
        <FormField
          label="Expiration Month"
          value={cardInformation.expirationDate?.slice(0, 2) || ""}
          onChange={(e) =>
            handleInputChange(
              "expirationDate",
              `${e.target.value}/${cardInformation.expirationDate?.slice(3)}`
            )
          }
        />
        <FormField
          label="Expiration Year"
          value={cardInformation.expirationDate?.slice(-2) || ""}
          onChange={(e) =>
            handleInputChange(
              "expirationDate",
              `${cardInformation.expirationDate?.slice(0, 2)}/${e.target.value}`
            )
          }
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="CVV"
          required
          extraLabel="3 or 4 digits"
          // onChange={(e) => handleInputChange("cvv", e.target.value)}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            checked={saveAddress}
            onChange={handleSaveAddress}
          />
          <span onClick={onCancel} className="shipping-text">
            Save card for later
          </span>
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
          onAddressChange={(updatedAddress: Address) =>
            setAddress(updatedAddress)
          }
        />
      ) : (
        <div className="checkbox-text">
          Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430
        </div>
      )}
    </div>
  );
};
