import { useAtom, useAtomValue } from "jotai";
import $ from "jquery";
import "parsleyjs";
import React, { useEffect, useRef, useState } from "react";
import {
  addShoppersPaymentMethod,
  generateCardToken,
  updateShopperDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { AddressForm } from "../../component/AddressForm";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { ShopperSavedPayments } from "../../interfaces/ShopperSavedPayments";
import { addressAtom, orderAtom } from "../../store";
import "./CardInformation.scss";
import { Button } from "../../component/Button/Button";
import { useApi } from "../../hooks/useAPI";
import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import { API_KEY, GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import { buildOrder } from "../../api/service/Order";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";

interface ICardInformationProps {
  initialData?: Partial<ShopperSavedPayments>;
  onCancel?: () => void;
  shopperId: string;
  showBillingSection?: boolean;
  onSaveTempCard: (card: ShopperSavedPayments) => void;
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
  onCancel,
  onSaveTempCard,
  showBillingSection = true,
}) => {
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);
  const [address, setAddress] = useState<Address>(
    initialData?.address || defaultAddress
  );

  const tempPaymentUrl = `${GET_API_ENDPOINT_BASE_URL}/shoppingcart-checkouts/v1/Checkout/TempCC/${shopperId}?api_key=${API_KEY}`;
  const { postData: addTempPaymentMethod } = useApi<IPaymentMethod>(
    tempPaymentUrl,
    "POST",
    undefined,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const addressList = useAtomValue(addressAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress = addressList.find((address) => address.isPrimary);
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

  const handleSaveAddress = async (type: "TEMP" | "WALLET") => {
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
      cvv: cardInformation.cvv,
    };

    if (type === "WALLET") {
      setSaveAddress(!saveAddress);
      try {
        const response = await addShoppersPaymentMethod(shopperId, {
          ...requestData,
        });
        const paymentMethod = response.find((pm) => pm.preferred);

        if (order && paymentMethod) {
          buildOrder(
            generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order?.paymentMethod,
                id: paymentMethod.id,
              },
            })
          ).then((orderResponse) => {
            setOrder(orderResponse.response.success.data);
          });
        }
        console.log("Card information successfully saved.");
      } catch (error) {
        console.error("Unable to save card information:", error);
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("name", requestData.name);
      formData.append("number", requestData.number);
      formData.append("month", requestData.month?.toString() || "");
      formData.append("year", requestData.year?.toString() || "");
      formData.append("type", requestData.type.toLocaleString());

      const paymentMethod = await addTempPaymentMethod(formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      onSaveTempCard(paymentMethod);

      if (order && paymentMethod) {
        buildOrder(
          generateChangeStoreResponse({
            ...order,
            paymentMethod: {
              ...order?.paymentMethod,
              id: paymentMethod.id,
            },
          })
        ).then((orderResponse) => {
          if (orderResponse.response.errors) {
            alert(orderResponse.response.errors.message);
            console.warn(orderResponse.response);
          }
          setOrder(orderResponse.response.success.data);
        });
      }
    }
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
        name="name"
      />
      <FormField
        label="Card Number"
        required
        data-parsley-required="true"
        value={cardInformation.cardMask || ""}
        onChange={(e) => handleInputChange("cardMask", e.target.value)}
        name="number"
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
          formName="month"
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
          formName="year"
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="CVV"
          required
          extraLabel="3 or 4 digits"
          maxLength={4}
          name="cvv"
          onChange={(e) => handleInputChange("cvv", e.target.value)}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            checked={saveAddress}
            onChange={() => handleSaveAddress("WALLET")}
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
          {shippingAddress?.first} {shippingAddress?.last}{" "}
          {shippingAddress?.address1}
          {shippingAddress?.address2} {shippingAddress?.city}{" "}
          {shippingAddress?.zip}
        </div>
      )}
      <div className="button-container">
        <Button btnType="secondary" label="Cancel" onClick={onCancel} />
        <Button
          btnType="primary"
          label="Save"
          onClick={() => handleSaveAddress("TEMP")}
        />
      </div>
    </div>
  );
};
