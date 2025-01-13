import { Field, Form, Formik, FormikErrors } from "formik";
import { useAtom } from "jotai";
import $ from "jquery";
import "parsleyjs";
import React, { RefObject, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { AddressList } from "../address-list/AddressList";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { fetchStatesAndCountries } from "../api/service/CountriesAndStates";
import { buildOrder } from "../api/service/Order";
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
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./Checkout.scss";

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

  const handleSaveAddress = async (address: {
    first: string;
    last: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    isPoBox: boolean;
    isUpdateEnabled: boolean;
  }) => {
    const addressEntered = {
      ...defaultAddress,
      ...address,
      id: shippingAddress.id || 0,
      country: "USA",
    };

    console.log(defaultAddress, address);

    if (childRef.current) {
      try {
        const isValidAddress = await childRef.current.verifyAddress({
          ...addressEntered,
        });
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

        console.log(validatedAddress);

        if (validatedAddress?.id && validatedAddress.id > 0) {
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

    setShippingAddress(
      updatedSelectedAddress.find((p) => p.isPrimary)
    ) as Address;
    setShopperAddressBook(updatedSelectedAddress);

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
  };

  const initialValues = {
    first: shippingAddress.first || "",
    last: shippingAddress.last || "",
    address1: shippingAddress.address1 || "",
    address2: shippingAddress.address2 || "",
    city: shippingAddress.city || "",
    state: shippingAddress.state || "",
    zip: shippingAddress.zip || "",
    phone: shippingAddress.phone || "",
    isPoBox: shippingAddress.isPoBox || false,
    isUpdateEnabled: isUpdateEnabled || false,
  };

  const validationSchema = Yup.object().shape({
    first: Yup.string().required("First name is required"),
    last: Yup.string().required("Last name is required"),
    address1: Yup.string().required("Address Line 1 is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State/Province is required"),
    zip: Yup.string().required("Zip code is required"),
    phone: Yup.string().required("Phone number is required"),
  });

  return (
    <div>
      <form className="shipping-address-form">
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
            /* Some countries display family name before first name (TWN/HKG/SGP) */
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleSaveAddress(values);
              }}
            >
              {({
                values,
                handleChange,
                setFieldValue,
                errors,
                touched,
                handleBlur,
                submitForm,
              }) => (
                <Form>
                  {familyNameFirst ? (
                    <div className="form-field-container">
                      <FormField
                        name="last"
                        label="Last Name"
                        required
                        value={values.last}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={touched.last && errors.last}
                      />
                      <FormField
                        name="first"
                        label="First Name"
                        required
                        value={values.first}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={touched.first && errors.first}
                      />
                    </div>
                  ) : (
                    <div className="form-field-container">
                      <FormField
                        name="first"
                        label="First Name"
                        required
                        value={values.first}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={touched.first && errors.first}
                      />
                      <FormField
                        name="last"
                        label="Last Name"
                        required
                        value={values.last}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={touched.last && errors.last}
                      />
                    </div>
                  )}

                  <div className="form-field-container-full">
                    <FormField
                      name="address1"
                      label="Address Line 1"
                      required
                      value={values.address1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.address1 && errors.address1}
                    />
                  </div>

                  <div className="form-field-container-full">
                    <FormField
                      name="address2"
                      label="Address Line 2"
                      value={values.address2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.address2 && errors.address2}
                    />
                  </div>

                  <div className="form-field-container">
                    <FormField
                      name="city"
                      label="City"
                      required
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.city && errors.city}
                    />
                    <DropdownField
                      options={stateDropdownList}
                      label="State/Province"
                      required
                      selectedValue={values.state}
                      formName="state"
                      onChange={(value) => setFieldValue("state", value)}
                    />
                  </div>

                  <div className="form-field-container">
                    <FormField
                      name="zip"
                      label="Zip Code"
                      required
                      value={values.zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      renderCheckBox={
                        <Checkbox
                          title="This address is a PO box"
                          checked={values.isPoBox}
                          name="isPoBox"
                          onChange={() =>
                            setFieldValue("isPoBox", !values.isPoBox)
                          }
                        />
                      }
                      errorMessage={touched.zip && !!errors.zip}
                    />
                    <FormField
                      name="phone"
                      label="Phone"
                      required
                      extraLabel="10 digits"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      renderCheckBox={
                        <Checkbox
                          title="Get Text Updates for this Order"
                          subtitle="Messaging data rates may apply."
                          checked={values.isUpdateEnabled}
                          onChange={() =>
                            setFieldValue(
                              "isUpdateEnabled",
                              !values.isUpdateEnabled
                            )
                          }
                        />
                      }
                      errorMessage={touched.phone && !!errors.phone}
                    />
                  </div>

                  {shopperAddressBook.length > 0 ? (
                    <div className="form-footer form-footer__dual-button">
                      <Button
                        label="Cancel"
                        btnType="secondary"
                        onClick={onCancelClick}
                      />
                      <Button
                        label="Save & Continue"
                        btnType="primary"
                        onClick={submitForm}
                      />
                    </div>
                  ) : (
                    <div className="form-footer">
                      <Button
                        label="Save Shipping Address & Continue"
                        btnType="primary"
                        onClick={submitForm}
                      />
                    </div>
                  )}
                </Form>
              )}
            </Formik>
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
