import { useAtom, useAtomValue } from "jotai";
import $ from "jquery";
import "parsleyjs";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { AddressList } from "../address-list/AddressList";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { fetchStatesAndCountries } from "../api/service/CountriesAndStates";
import {
  useCreateShopperAddressBookEntry,
  useUpdateShopperAddressBookEntry,
  useUpdateTextUpdatesForPhone,
} from "../api/service/ShopperAddressBook";
import { fetchSiteData } from "../api/service/Site";
import { Back } from "../assets/svgs/Back";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { AddressHandler } from "../interfaces/AddressHandler";
import { DropdownOption } from "../interfaces/DropdownOption";
import { addressAtom, orderAtom } from "../store";
import "./Checkout.scss";
import { buildOrder } from "../api/service/Order";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";

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

interface ICheckout {
  shopperId: string;
  cartId: string;
  addresses: any;
}

export const Checkout: React.FC<ICheckout> = ({
  shopperId,
  cartId,
  addresses,
}) => {
  const siteId = "260"; /*todo - need to update with dynamic siteId*/
  // State to manage whether the form is expanded or collapsed

  const { createShopperAddressBookEntry } = useCreateShopperAddressBookEntry();
  const { updateShopperAddressBookEntry } = useUpdateShopperAddressBookEntry();
  const { updateTextUpdatesForPhone } = useUpdateTextUpdatesForPhone();

  const [shippingAddress, setShippingAddress] =
    useState<Address>(defaultAddress);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShipAddressForm, setShowShipAddressForm] = useState(false);
  const [shopperAddressBook, setShopperAddressBook] = useAtom(addressAtom);
  const [showAVS, setShowAVS] = useState(false);
  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );

  const [order, setOrder] = useAtom(orderAtom);

  const buildShoppersAddressBookFromResponse = (
    addressBookResponse: Address[]
  ) => {
    let filteredAddresses: Address[] = [];
    let hasPrimaryAddress: boolean = false;
    addressBookResponse.forEach((address: Address) => {
      if (address.id) {
        const newAddress: Address = {
          id: address.id,
          isPrimary: address.isPrimary,
          first: address.first,
          last: address.last,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          state: address.state,
          zip: address.zip,
          phone: address.phone,
          isPoBox: address.isPoBox,
        } as Address;
        if (newAddress.isPrimary) {
          hasPrimaryAddress = true;
          setShippingAddress(newAddress);
        }
        filteredAddresses.push(newAddress);
      }
    });

    if (!hasPrimaryAddress) {
      setShippingAddress(filteredAddresses[0] ?? defaultAddress);
    }
    setShowShipAddressForm(filteredAddresses.length < 1);
    return filteredAddresses;
  };

  const [familyNameFirst, setFamilyNameFirst] = useState(false);
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false); // New state to track edit mode

  const shipFormRef = useRef<HTMLFormElement>(null);
  const childRef = useRef<AddressHandler>(null);

  useEffect(() => {
    setShopperAddressBook(buildShoppersAddressBookFromResponse(addresses));
  }, []);

  // Function to toggle accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePhoneShippingUpdates = () => {
    setIsUpdateEnabled(!isUpdateEnabled);
    updateTextUpdatesForPhone(shippingAddress.phone);
  };

  useEffect(() => {
    $(".shipping-address-form").parsley();
  }, []);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const response = await fetchSiteData(siteId);
        setFamilyNameFirst(response.locale.familyNameFirst);
      } catch (error) {
        console.error("Failed to fetch site info:", error);
      }
    };

    fetchSiteInfo();
  }, []);

  useEffect(() => {
    const fetchCountryAndStateData = async () => {
      try {
        const response = await fetchStatesAndCountries(siteId);
        const stateList: DropdownOption[] = response.map((item: any) => ({
          label: item.description,
          value: item.regionID,
        }));
        setStateDropdownList(stateList);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchCountryAndStateData();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const buildAddress = (formRef: RefObject<HTMLFormElement>): Address => {
      let address: Address = {
        ...defaultAddress, // Spread defaults for optional fields
      };

      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());

        // Assign values for mandatory fields
        address.id = Number(data.id) || shippingAddress.id;
        address.first = (data.first as string) || "";
        address.last = (data.last as string) || "";
        address.address1 = (data.address1 as string) || "";
        address.address2 = (data.address2 as string) || "";
        address.zip = (data.zip as string) || "";
        address.city = (data.city as string) || "";
        address.state = (data.state as string) || "";
        address.phone = (data.phone as string) || "";
        address.isPoBox =
          Boolean(data.isPoBox === "on" ? true : false) || false;
        address.isPrimary = Number(data.isPrimary) || 1;

        // Assign optional fields if they are available
        address.country = (data.country as string) || "USA";
      }
      return address;
    };

    if (childRef.current) {
      const addressEntered = buildAddress(shipFormRef);
      childRef.current.setAddressToVerify(addressEntered);

      try {
        const isValidAddress = await childRef.current.verifyAddress(
          addressEntered
        );
        const validatedAddress = { ...addressEntered };

        setShippingAddress(validatedAddress);
        setShowShipAddressForm(false);

        const updatedAddresses = [
          { ...validatedAddress, isPrimary: 1 }, // Set the validated address as primary
          ...shopperAddressBook
            .filter((address) => address.id !== validatedAddress.id) // Exclude the validated address
            .map((address) => ({ ...address, isPrimary: 0 })), // Reset isPrimary for other addresses
        ];

        setShopperAddressBook(updatedAddresses);
        setShowAVS(!isValidAddress);

        const addressParams = new URLSearchParams(
          Object.entries(validatedAddress as Address)
        ).toString();

        if (validatedAddress.id > 0) {
          // Use PUT request for existing address (update)
          await updateShopperAddressBookEntry(
            shopperId,
            validatedAddress.id,
            addressParams
          );
        } else {
          // Use POST request for new address (create)
          await createShopperAddressBookEntry(shopperId, addressParams);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };
  const handleEditClick = () => {
    setShowAVS(false);
    setShowShipAddressForm(true);
  };

  const handleNewAddressClick = () => {
    window.scrollTo(0, 0);
    setShippingAddress(defaultAddress);
    setShowShipAddressForm(!showShipAddressForm);
  };

  const handleEditAddressClick = (address: Address) => {
    setShippingAddress(address);
    setShowShipAddressForm(!showShipAddressForm);
  };

  const handleUseSelectedAddress = () => {
    setShowAVS(!showAVS);
  };

  const onCancelClick = () => {
    setShowShipAddressForm(!showShipAddressForm);
    setShippingAddress(
      shopperAddressBook.find((address) => address.isPrimary === 1) ||
        shippingAddress
    );
    setIsExpanded(!isExpanded);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const address = {
      ...shippingAddress,
      [name]: value,
    };
    setShippingAddress(address);
  };

  const handlePOBoxChange = () => {
    setShippingAddress({
      ...shippingAddress,
      isPoBox: !shippingAddress.isPoBox,
    });
  };

  const handleAddressSelectChange = async (id: number) => {
    const updatedSelectedAddress = shopperAddressBook.map(
      (address) =>
        address.id === id
          ? { ...address, isPrimary: 1 }
          : { ...address, isPrimary: 0 } // Reset other addresses' `isPrimary` to 0
    );

    const newOrder = await buildOrder(
      generateChangeStoreResponse({
        ...order,
        shippingAddress: {
          ...order?.shippingAddress,
          id,
        },
      })
    );

    setOrder(newOrder.response.success.data);

    setShopperAddressBook(updatedSelectedAddress);
  };

  return (
    <div>
      <form
        className="shipping-address-form"
        ref={shipFormRef}
        onSubmit={handleSaveAddress}
      >
        <div
          className={`${!showAVS ? "form-container" : "form-container__hide"}`}
        >
          <div className="form-header">
            <FormHeading title="Shipping Address" />
            {shopperAddressBook.length > 0 && (
              <Back
                className={`accordion ${isExpanded ? "open" : "close"}`}
                onClick={toggleAccordion}
              />
            )}
          </div>

          {/* show details fields based on accordion state close  */}
          {!showShipAddressForm && (
            <div className="shipping-address">
              <AddressDisplay
                address={shippingAddress}
                familyNameFirst={familyNameFirst}
              />
              {shopperAddressBook.length > 0 && isExpanded && (
                <AddressList
                  addressBook={shopperAddressBook}
                  familyNameFirst={familyNameFirst}
                  onSelectChange={handleAddressSelectChange}
                  onAddNewAddressClick={handleNewAddressClick}
                  onEditAddressClick={handleEditAddressClick}
                />
              )}
            </div>
          )}

          {/* Conditionally render form fields based on accordion state */}
          {showShipAddressForm && (
            /*some countries display family name before first name (TWN/HKG/SGP)*/
            <>
              {familyNameFirst ? (
                <div className="form-field-container">
                  <FormField
                    label="Last Name"
                    required
                    name="last"
                    data-parsley-required="true"
                    value={shippingAddress.last}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="First Name"
                    required
                    name="first"
                    data-parsley-required="true"
                    value={shippingAddress.first}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="form-field-container">
                  <FormField
                    label="First Name"
                    required
                    name="first"
                    data-parsley-required="true"
                    value={shippingAddress.first}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Last Name"
                    required
                    name="last"
                    data-parsley-required="true"
                    value={shippingAddress.last}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="form-field-container-full">
                <FormField
                  label="Address Line 1"
                  required
                  name="address1"
                  data-parsley-required="true"
                  value={shippingAddress.address1}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field-container-full">
                <FormField
                  label="Address Line 2"
                  name="address2"
                  value={shippingAddress.address2}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field-container">
                <FormField
                  label="City"
                  required
                  name="city"
                  data-parsley-required="true"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                />
                <DropdownField
                  options={stateDropdownList}
                  label="State/Province"
                  required
                  selectedValue={shippingAddress.state}
                  formName="state"
                  onChange={(value) => {
                    const address = {
                      ...shippingAddress,
                      state: value,
                    };
                    setShippingAddress(address);
                  }}
                />
              </div>

              <div className="form-field-container">
                <FormField
                  label="Zip Code"
                  required
                  renderCheckBox={
                    <Checkbox
                      title="This address is a PO box"
                      checked={shippingAddress.isPoBox}
                      name="isPoBox"
                      onChange={handlePOBoxChange}
                    />
                  }
                  name="zip"
                  data-parsley-required="true"
                  value={shippingAddress.zip}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Phone"
                  required
                  extraLabel="10 digits"
                  data-parsley-required="true"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  renderCheckBox={
                    <Checkbox
                      title="Get Text Updates for this Order"
                      subtitle="Messaging data rates may apply."
                      checked={isUpdateEnabled}
                      onChange={handlePhoneShippingUpdates}
                    />
                  }
                />
              </div>

              {shopperAddressBook.length > 0 ? (
                <div className="form-footer form-footer__dual-button">
                  <Button
                    label="Cancel"
                    type="secondary"
                    onClick={onCancelClick}
                  />
                  <Button
                    label="Save & Continue"
                    type="primary"
                    onClick={handleSaveAddress}
                  />
                </div>
              ) : (
                <div className="form-footer">
                  <Button
                    label="Save Shipping Address & Continue"
                    type="primary"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </form>
      <AddressVerificationContainer
        ref={childRef}
        showAvs={showAVS}
        onClick={handleEditClick}
        onSelectAddress={handleUseSelectedAddress}
      />
    </div>
  );
};
