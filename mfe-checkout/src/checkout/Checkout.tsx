import React, { RefObject, useEffect, useRef, useState } from "react";
import $ from "jquery";
import "parsleyjs";
import "./Checkout.scss";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { FormField } from "../component/Form/Field/FormField";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Back } from "../assets/svgs/Back";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { AddressHandler } from "../interfaces/AddressHandler";
import { Address } from "../interfaces/Address";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { fetchStatesAndCountries } from "../api/service/CountriesAndStates";
import { DropdownOption } from "../interfaces/DropdownOption";
import { createShopperAddressBookEntry, fetchShopperAddressBook } from "../api/service/ShopperAddressBook";
import { fetchSiteData } from "../api/service/Site";
import { AddressList } from "../address-list/AddressList";

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

export const Checkout: React.FC = () => {
  const siteId = "260"; /*todo - need to update with dynamic siteId*/
  // State to manage whether the form is expanded or collapsed

  const [isExpanded, setIsExpanded] = useState(false);
  const [showShipAddressForm, setShowShipAddressForm] = useState(false);
  const [shopperAddressBook, setShopperAddressBook] = useState<Address[]>([]);
  const [shippingAddress, setShippingAddress] =
    useState<Address>(defaultAddress);
  const [showAVS, setShowAVS] = useState(false);
  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );
  const [familyNameFirst, setFamilyNameFirst] = useState(false);

  const shipFormRef = useRef<HTMLFormElement>(null);
  const childRef = useRef<AddressHandler>(null);

  // Function to toggle accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
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

  useEffect(() => {
    const shopperID =
      "hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; /*todo - need to update with dynamic shopperId*/
      //"mZjhWVwjzVzpVzhYxWzpeWXzUzUxepzXYXVWzkjh"; //shopperId with empty addressbook
    const fetchAddressBookData = async () => {
      try {
        const response = await fetchShopperAddressBook(shopperID);
        const addressList: Address[] =
          buildShoppersAddressBookFromResponse(response);
        setShopperAddressBook(addressList);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchAddressBookData();
  }, []);

  const buildShoppersAddressBookFromResponse = (addressBookResponse: any) => {
    let filteredAddresses: Address[] = [];
    let hasPrimaryAddress: boolean = false;
    addressBookResponse.forEach((address: any) => {
      if (address.hasAddress as boolean) {
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
        };
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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const shopperID =
      "hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj";
    const buildAddress = (formRef: RefObject<HTMLFormElement>) => {
      let address: Address = defaultAddress;
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());

        address.first = data.first as string | "";
        address.last = data.last as string | "";
        address.address1 = data.address1 as string | "";
        address.address2 = data.address2 as string | "";
        address.zip = data.zip as string | "";
        address.city = data.city as string | "";
        address.state = data.state as string | "";
        address.phone = data.phone as string | "";
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
        setShippingAddress(addressEntered);
        setShowShipAddressForm(false);
        const updatedAddresses = [...shopperAddressBook, addressEntered]
        setShopperAddressBook(updatedAddresses);
        setShowAVS(!isValidAddress);
        await createShopperAddressBookEntry(shopperID, addressEntered)
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleEditClick = () => {
    console.log("edit button clicked");
    setShowAVS(false);
    setShowShipAddressForm(true);
  };

  const handleNewAddressClick = () => {
    setShippingAddress(defaultAddress)
    setShowShipAddressForm(!showShipAddressForm)
  }

  const handleUseSelectedAddress = () => {
    setShowShipAddressForm(!showShipAddressForm)
  }

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
                  onAddNewAddressClick={handleNewAddressClick}
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
                    name={"last"}
                    data-parsley-required="true"
                    value={shippingAddress.last}
                  />
                  <FormField
                    label="First Name"
                    required
                    name={"first"}
                    data-parsley-required="true"
                    value={shippingAddress.first}
                  />
                </div>
              ) : (
                <div className="form-field-container">
                  <FormField
                    label="First Name"
                    required
                    name={"first"}
                    data-parsley-required="true"
                    value={shippingAddress.first}
                  />
                  <FormField
                    label="Last Name"
                    required
                    name={"last"}
                    data-parsley-required="true"
                    value={shippingAddress.last}
                  />
                </div>
              )}
              <div className="form-field-container-full">
                <FormField
                  label="Address Line 1"
                  required
                  name={"address1"}
                  data-parsley-required="true"
                  value={shippingAddress.address1}
                />
              </div>
              <div className="form-field-container-full">
                <FormField
                  label="Address Line 2"
                  name={"address2"}
                  value={shippingAddress.address2}
                />
              </div>
              <div className="form-field-container">
                <FormField
                  label="City"
                  required
                  name={"city"}
                  data-parsley-required="true"
                  value={shippingAddress.city}
                />
                <DropdownField
                  options={stateDropdownList}
                  label="State/Province"
                  required
                  selectedValue={shippingAddress.state}
                  formName={"state"}
                />
              </div>

              <div className="form-field-container">
                <FormField
                  label="Zip Code"
                  required
                  renderCheckBox={<Checkbox title="This address is a PO box" />}
                  name={"zip"}
                  data-parsley-required="true"
                  value={shippingAddress.zip}
                />
                <FormField
                  label="Phone"
                  required
                  extraLabel="10 digits"
                  data-parsley-required="true"
                  name={"phone"}
                  value={shippingAddress.phone}
                  renderCheckBox={
                    <Checkbox
                      title="Get Text Updates for this Order"
                      subtitle="Messaging data rates may apply."
                    />
                  }
                />
              </div>
              {shopperAddressBook.length > 0 ?
                  <div className="form-footer form-footer__dual-button">
                    <Button label="Cancel" type="secondary"/>
                    <Button label="Save & Continue" type="primary"/>
                  </div>
                  :
                  <div className="form-footer">
                    <Button
                        label="Save Shipping Address & Continue"
                        type="primary"
                    />
                  </div>
              }
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
