import { Form, Formik } from "formik";
import { useAtom } from "jotai";
import "parsleyjs";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { AddressList } from "../address-list/AddressList";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { fetchStatesAndCountries } from "../api/service/CountriesAndStates";
import { buildOrder } from "../api/service/Order";
import {
  useCreateShopperAddressBookEntry,
  useUpdateShopperAddressBookEntry,
} from "../api/service/ShopperAddressBook";
import { Back } from "../assets/svgs/Back";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { AddressHandler } from "../interfaces/AddressHandler";
import { DropdownOption } from "../interfaces/DropdownOption";
import {
  addressAtom,
  loadingAtom,
  orderAtom,
  orderNotificationsAtom,
} from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./Checkout.scss";
import { siteApiData } from "./siteAtom";
import { getOrderNotifications, orderHasDefaultMAShipAddress } from "../utils/OrderUtils";
import { AddressAutocomplete } from "../component/AddressForm/AddressAutoComplete";
import {
  getFilteredShippingAddresses,
  getShippingAddressFromFilteredList,
  isAddressDefaultMAAddress,
  setAddressAsShipInAddressList,
  isAddressEqual,
  isEmptyAddress, isAddressInAddressList,
} from "../utils/AddressUtils";
import { useContentStrings } from "../hooks/useContentStrings";
import ScrollToError from "../component/Form/ScrollToError/ScrollToError";
import { CustomerProfile, isEZRegShopper } from "../interfaces/CustomerProfile";

const defaultAddress: Address = {
  id: 0,
  isShip: 0,
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
  siteId: string;
  addresses: any;
  pcid: string;
  isGuest: boolean;
  customerData: CustomerProfile | null;
  isUniversalOrderBuilt: boolean;
}

const Checkout: React.FC<ICheckout> = ({
  shopperId,
  siteId,
  addresses,
  pcid,
  isGuest,
  customerData,
  isUniversalOrderBuilt,
}) => {
  // State to manage whether the form is expanded or collapsed
  const { getString } = useContentStrings();
  const { createShopperAddressBookEntry } = useCreateShopperAddressBookEntry();
  const { updateShopperAddressBookEntry } = useUpdateShopperAddressBookEntry();
  const [isEditAddressClicked, SetIsEditAddressClicked] =
    useState<boolean>(false);
  const [shippingAddress, setShippingAddress] =
    useState<Address>(defaultAddress);
  const [validAddressEntered, setValidAddressEntered] =
    useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddNewShipAddress, setIsAddNewShipAddress] = useState(false);
  const [showShipAddressForm, setShowShipAddressForm] = useState(false);
  const [shopperAddressBook, setShopperAddressBook] = useAtom(addressAtom);
  const [showAVS, setShowAVS] = useState(false);
  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [order, setOrder] = useAtom(orderAtom);
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const [siteData] = useAtom(siteApiData(siteId));
  const [enableAddressSuggestions, setEnableAddressSuggestions] =
    useState(false);

  const hasAddress = shopperAddressBook.some((s) => s.hasAddress);
  const enableAutoSaveShipAddress = isGuest || (!isEditAddressClicked && (!hasAddress || orderHasDefaultMAShipAddress(order || null)));

  const errorRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});

  const buildShoppersAddressBookFromResponse = (
    addressBookResponse: Address[]
  ) => {
    let filteredAddresses: Address[] = getFilteredShippingAddresses(
      addressBookResponse,
      siteData.siteCountryCode
    );
    setShippingAddress(
      getShippingAddressFromFilteredList(filteredAddresses) || defaultAddress
    );
    setShowShipAddressForm(filteredAddresses.length < 1);
    return filteredAddresses;
  };

  const childRef = useRef<AddressHandler>(null);

  const [loading, setLoading] = useAtom(loadingAtom);

  useEffect(() => {
    initializeShipAddressForm();
  }, []);

  useEffect(() => { //handle shipping address when it is a callback/page reload (ie third party checkout)
    if(isGuest && isUniversalOrderBuilt){
      initializeShipAddressForm();
    }
  }, [isUniversalOrderBuilt]);

  const initializeShipAddressForm = () => {
    const filteredAddresses = getFilteredShippingAddresses(addresses, siteData.siteCountryCode);
    if(order && order.shippingAddress && !isAddressDefaultMAAddress(order.shippingAddress)){
      setShippingAddress(order.shippingAddress);
      if(isAddressInAddressList(filteredAddresses, order.shippingAddress)){
        setShopperAddressBook(setAddressAsShipInAddressList(filteredAddresses, order.shippingAddress));
      }else{
        setShopperAddressBook([{ ...order.shippingAddress, hasAddress: 1, isoalpha3Code: order.shippingAddress.country }]);
      }
    } else if(orderHasDefaultMAShipAddress(order || null)){ //order may have already been built without ship address (ie: guest)
      setShippingAddress(defaultAddress);
      setShowShipAddressForm(true);
    } else {
      setShopperAddressBook(buildShoppersAddressBookFromResponse(filteredAddresses));
    }
  };

  // Function to toggle accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

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
        console.error("Failed to fetch data", error);
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
  }) => {
    const addressEntered = buildAddressFromAddressForm(address);

    scrollTo(0, 0);
    setLoading(true);

    if (childRef.current) {
      try {
        const { isValidAddress, hashCode } = await childRef.current.verifyAddress({
          ...addressEntered,
        });

        const validatedAddress = { ...addressEntered, hashCode: hashCode, defaultaddr: true, hasAddress: 1, isoalpha3Code: addressEntered.country };

        const updatedAddresses = [
          { ...validatedAddress, isShip: 1 }, // Set the validated address as primary
          ...shopperAddressBook
            .filter((address) => address.id !== validatedAddress.id) // Exclude the validated address
            .map((address) => ({ ...address, isShip: 0 })), // Reset isShip for other addresses
        ];
        setShopperAddressBook(updatedAddresses);
        setShippingAddress(validatedAddress);
        if (isValidAddress) {
          setValidAddressEntered(isValidAddress);
          setShowShipAddressForm(isGuest); //shipping form stays open for guest
          setShowAVS(false);
        } else {
          setShowAVS(true);
        }
      } catch (error) {
        setLoading(false);
      } finally {
        setErrorMessage("");
        setIsAddNewShipAddress(false);
      }
    }
  };

  const buildAddressFromAddressForm = (address: {
    first: string;
    last: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    isPoBox: boolean;
  }): Address => {
    return {
      ...defaultAddress,
      ...address,
      phone: address?.phone?.replace(/\D/g, ""),
      id: shippingAddress.id || 0,
      country: siteData.siteCountryCode,
    };
  };

  useEffect(() => {
    if (validAddressEntered && shippingAddress) {
      handleUseSelectedAddress();
    }
  }, [shippingAddress, validAddressEntered]);

  const handleEditClick = () => {
    setShowAVS(false);
    setShowShipAddressForm(true);
  };

  const handleNewAddressClick = () => {
    window.scrollTo(0, 0);
    setShippingAddress(defaultAddress);
    setShowShipAddressForm(!showShipAddressForm);
    setIsAddNewShipAddress(true);
  };

  const handleEditAddressClick = (address: Address) => {
    SetIsEditAddressClicked(true);
    setShippingAddress(address);
    setShowShipAddressForm(!showShipAddressForm);
  };

  const handleUseSelectedAddress = async () => {
    try {
      setLoading(true);
      const addressParams = new URLSearchParams(
        Object.entries(shippingAddress as Address)
      ).toString();

      if(isGuest){ //just update the order, do not try to do any addressbook updates
        const hasPcid = pcid && pcid.length > 0;
        if(!hasPcid){
          //Make shopper put in an email address so we have a PCID to build the order
          setShopperAddressBook([{ ...shippingAddress, hasAddress: 1, isoalpha3Code: shippingAddress.country }]); // maintain the address entered so it doesn't get wiped out
          setShowAVS(false);
          setLoading(false);
          return;
        }
        if (order && hasPcid) {
          const newOrder = await buildOrder(
              generateChangeStoreResponse({
                ...order,
                shippingAddress: {
                  first: shippingAddress.first,
                  last: shippingAddress.last,
                  address1: shippingAddress.address1,
                  address2: shippingAddress.address2,
                  address3: shippingAddress.address3,
                  address4: shippingAddress.address4,
                  address5: shippingAddress.address5,
                  address6: shippingAddress.address6,
                  address7: shippingAddress.address7,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zip: shippingAddress.zip,
                  phone: shippingAddress.phone,
                  isPoBox: shippingAddress.isPoBox,
                  country: shippingAddress.country
                },
              }, pcid)
          );

          setOrder(newOrder.response.success.data);
          setOrderNotifications(
              getOrderNotifications(newOrder.response.success)
          );
          setShowShipAddressForm(true);
          setErrorMessage("");
        }
      } else{
        //update shoppers addressbook and update the order with the address
        if (shippingAddress?.id && shippingAddress.id > 0) {
          // Use PUT request for existing address (update)
          const updatedAddresses = await updateShopperAddressBookEntry(
              shopperId,
              shippingAddress.id,
              addressParams
          );

          if (order) {
            const newOrder = await buildOrder(
                generateChangeStoreResponse({
                  ...order,
                  shippingAddress: {
                    ...order.shippingAddress,
                    id: shippingAddress.id,
                  },
                }, pcid)
            );

            setOrder(newOrder.response.success.data);
            setOrderNotifications(
                getOrderNotifications(newOrder.response.success)
            );

            setShopperAddressBook(
                getFilteredShippingAddresses(
                    updatedAddresses,
                    siteData.siteCountryCode
                )
            );
            setShowShipAddressForm(false);
            setErrorMessage("");
          }
        } else {
          // Use POST request for new address (create)
          const updatedAddressList: Address[] =
              await createShopperAddressBookEntry(shopperId, addressParams);
          //update address atom with new addresslist
          setShopperAddressBook(
              getFilteredShippingAddresses(
                  updatedAddressList,
                  siteData.siteCountryCode
              )
          );
          const newAddedAddress = updatedAddressList.find(
              (address) => address.isShip
          );

          if (newAddedAddress && order) {
            const newOrder = await buildOrder(
                generateChangeStoreResponse({
                  ...order,
                  shippingAddress: {
                    ...newAddedAddress,
                    id: newAddedAddress.id,
                  },
                  billingAddress: {
                    ...order?.billingAddress,
                    id: newAddedAddress.id,
                  },
                }, pcid)
            );

            setOrder(newOrder.response.success.data);
            setOrderNotifications(
                getOrderNotifications(newOrder.response.success)
            );
            setShippingAddress(newAddedAddress);
            setShowShipAddressForm(false);
            setIsExpanded(false);
            setErrorMessage("");
          }
        }
      }
      setIsExpanded(false);
      setLoading(false);
      if (validAddressEntered) {
        setValidAddressEntered(false);
      } else {
        setShowAVS(!showAVS);
      }
    } catch (error: any) {
      setLoading(false);
      setValidAddressEntered(false);
      setErrorMessage(error.response.data);
    }
  };

  const onCancelClick = () => {
    setErrorMessage("");
    setShowShipAddressForm(!showShipAddressForm);
    setShippingAddress(
      shopperAddressBook.find((address) => address.isShip === 1) ||
        shippingAddress
    );
    setIsExpanded(!isExpanded);
    setIsAddNewShipAddress(false);
  };

  const handleAddressSelectChange = async (id: number) => {
    setLoading(true);
    const updatedSelectedAddress = shopperAddressBook.map(
      (address) =>
        address.id === id
          ? { ...address, isShip: 1 }
          : { ...address, isShip: 0 } // Reset other addresses' `isShip` to 0
    );

    const updatedAddress = updatedSelectedAddress.find((add) => add.id === id);

    if (childRef.current && updatedAddress) {
      await childRef.current.verifyAddress({
        ...updatedAddress,
        isShip: 0,
      });
      const validatedAddress = {
        ...updatedAddress,
        isShip: 0,
        defaultaddr: true,
        country: "USA",
      };

      const addressParams = new URLSearchParams(
        Object.entries(validatedAddress as Address)
      ).toString();

      await updateShopperAddressBookEntry(shopperId, id, addressParams);
    }

    setShippingAddress(
      updatedSelectedAddress.find((p) => p.isShip)
    ) as unknown as Address;
    setShopperAddressBook(updatedSelectedAddress);
    setErrorMessage("");

    const newOrder = await buildOrder(
      generateChangeStoreResponse({
        ...order,
        shippingAddress: {
          ...order?.shippingAddress,
          id,
        },
        billingAddress: {
          ...order?.billingAddress,
          id: id,
        },
      }, pcid)
    );

    if (
      newOrder.response.success.notifications &&
      newOrder.response.success.notifications[0]?.reason
    ) {
      scrollTo(0, 0);
      setErrorMessage(newOrder.response.success.notifications[0].reason);
    }

    setOrder(newOrder.response.success.data);
    setOrderNotifications(getOrderNotifications(newOrder.response.success));
    setLoading(false);
    setIsExpanded(false);
  };

  function getInitialAddressValues(): any {
    return {
      first: shippingAddress.first || (!isEZRegShopper(customerData) && !isGuest ? customerData?.first_name : "") ||
          "",
      last: shippingAddress.last || (!isEZRegShopper(customerData) && !isGuest ? customerData?.last_name : "") || "",
      address1: shippingAddress.address1 || "",
      address2: shippingAddress.address2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      zip: shippingAddress.zip || "",
      phone: shippingAddress.phone || "",
      isPoBox: shippingAddress.isPoBox || false,
    };
  }

  const validationSchema = Yup.object().shape({
    first: Yup.string()
      .required(getString("errFirstNameEmpty"))
      .max(30, getString("firstNameMax30Chars")),
    last: Yup.string()
      .required(getString("errLastNameRequired"))
      .max(30, getString("lastNameMax30Chars")),
    address1: Yup.string()
      .required(getString("hpPortalAdmin-errAddrReq"))
      .max(200, getString("addressMax200Chars")),
    city: Yup.string()
      .required(getString("hpPortalAdmin-errCityReq"))
      .max(100, getString("cityNameExceeds100Characters")),
    state: Yup.string().required(getString("pleaseEnterStateOrProvince")),
    zip: Yup.string()
      .matches(/^\d{5}(-\d{4})?$/, getString("invalidZipCode"))
      .required(getString("hpPortalAdmin-errPostalReq")),
    phone: Yup.string()
      .required(getString("pleaseEnterPhoneNumber"))
      .test(
        "valid-phone-format",
        getString("phoneNumber10Digits") as string,
        function (value) {
          const normalized = (value || "").replace(/\D/g, ""); // Remove non-digit characters
          return /^\d{10}$/.test(normalized);
        }
      ),
  });

  const handleAddress1Change = (
    name: string,
    setFieldValue: any,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value.length > 2) {
      setEnableAddressSuggestions(true);
    }
    setFieldValue(name, value);
  };

  function hasOrderShipAddress(): boolean {
    return !!(order?.shippingAddress && !isEmptyAddress(order?.shippingAddress) && !orderHasDefaultMAShipAddress(order || null));
  }

  function getPrefillAddressValues(): any {
    if(hasOrderShipAddress() && !isAddNewShipAddress){
      return order?.shippingAddress;
    }
    return getInitialAddressValues();
  }

  return (
    <div>
      <form className="qa-address-section shipping-address-form">
        <div
          className={`${
            !showAVS
              ? "checkout-form-container"
              : "checkout-form-container__hide"
          }`}
        >
          <div className="form-header">
            <FormHeading title={getString("shippingAddress") as string} />
            {shopperAddressBook.length > 0 && (
              <Back
                className={`qa-expand mfe-accordion ${
                  isExpanded ? "open" : "close"
                }`}
                onClick={toggleAccordion}
              />
            )}
          </div>

          {errorMessage && (
            <div className="error-message error-address-verification">
              {errorMessage}
            </div>
          )}

          {/* show details fields based on accordion state close  */}
          {!showShipAddressForm && (
            <div className="shipping-address js-checkout-shipping-address" data-ship-address-id={shippingAddress.id}>
              {!isExpanded && (
                <AddressDisplay
                  address={shippingAddress}
                  familyNameFirst={siteData.locale.familyNameFirst}
                />
              )}
              {shopperAddressBook.length > 0 && isExpanded && (
                <AddressList
                  addressBook={shopperAddressBook}
                  familyNameFirst={siteData.locale.familyNameFirst}
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
              initialValues={getPrefillAddressValues()}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleSaveAddress(values);
              }}
              validateOnMount={true}
              enableReinitialize={true}
            >
              {({
                setFieldTouched,
                values,
                handleChange,
                setFieldValue,
                errors,
                touched,
                handleBlur,
                submitForm,
                isValid,
                dirty
              }) => {

                const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
                const lastSavedAddressRef = useRef<Address | null>(null);

                useEffect(() => { //detect when to save ship address (removal of save and continue button)
                  if(!enableAutoSaveShipAddress) {
                    return;
                  }

                  const currentAddress = buildAddressFromAddressForm(values);

                  const hasChangedSinceLastSave =
                      !lastSavedAddressRef.current || !isAddressEqual(lastSavedAddressRef.current, currentAddress);

                  const shouldSave = isValid && dirty && hasChangedSinceLastSave;

                  if (shouldSave) {
                    // Clear previous timeout to debounce
                    if (saveTimeoutRef.current) {
                      clearTimeout(saveTimeoutRef.current);
                    }

                    // Set a new timeout to delay save until user stops typing
                    saveTimeoutRef.current = setTimeout(() => {
                      handleSaveAddress(values);
                      lastSavedAddressRef.current = currentAddress;
                    }, 1500); // 1500ms after user stops typing
                  }

                  return () => {
                    if (saveTimeoutRef.current) {
                      clearTimeout(saveTimeoutRef.current);
                    }
                  };
                }, [values, isValid, dirty]);


                return (
                <Form>
                  <ScrollToError errorRefs={errorRefs} />
                  <AddressAutocomplete
                    enableAddressSuggestions={enableAddressSuggestions}
                    country={siteData?.locale?.countryCode}
                  />
                  {siteData.locale.familyNameFirst ? (
                    <div className="form-field-container">
                      <FormField
                        qaTag="qa-last-name"
                        name="last"
                        label={getString("lastName")}
                        required
                        value={values.last}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onInput={() => setFieldTouched("last", true, false)}
                        errorMessage={touched.last && errors.last}
                        errorRefs={errorRefs}
                      />
                      <FormField
                        qaTag="qa-first-name"
                        name="first"
                        label={getString("firstName")}
                        required
                        value={values.first}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onInput={() => setFieldTouched("first", true, false)}
                        errorMessage={touched.first && errors.first}
                        errorRefs={errorRefs}
                      />
                    </div>
                  ) : (
                    <div className="form-field-container">
                      <FormField
                        qaTag="qa-first-name"
                        name="first"
                        label={getString("firstName")}
                        required
                        value={values.first}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onInput={() => setFieldTouched("first", true, false)}
                        errorMessage={touched.first && errors.first}
                        errorRefs={errorRefs}
                      />
                      <FormField
                        qaTag="qa-last-name"
                        name="last"
                        label={getString("lastName")}
                        required
                        value={values.last}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onInput={() => setFieldTouched("last", true, false)}
                        errorMessage={touched.last && errors.last}
                        errorRefs={errorRefs}
                      />
                    </div>
                  )}

                  <div className="form-field-container-full">
                    <FormField
                      className="qa-address input-container js-ship-address1"
                      name="address1"
                      label={getString("addressLine1")}
                      required
                      value={values.address1}
                      onChange={(e) =>
                        handleAddress1Change("address1", setFieldValue, e)
                      }
                      onBlur={handleBlur}
                      onInput={() => setFieldTouched("address1", true, false)}
                      errorMessage={touched.address1 && errors.address1}
                      errorRefs={errorRefs}
                    />
                  </div>

                  <div className="form-field-container-full">
                    <FormField
                      qaTag="qa-address-2"
                      name="address2"
                      label={getString("addressLine2")}
                      value={values.address2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onInput={() => setFieldTouched("address2", true, false)}
                      errorMessage={touched.address2 && errors.address2}
                      errorRefs={errorRefs}
                    />
                  </div>

                  <div className="form-field-container">
                    <FormField
                      qaTag="qa-city"
                      name="city"
                      label={getString("city")}
                      required
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onInput={() => setFieldTouched("city", true, false)}
                      errorMessage={touched.city && errors.city}
                      errorRefs={errorRefs}
                    />
                    <DropdownField
                      qaTag="qa-state"
                      options={stateDropdownList}
                      label={getString("deliverDelayMessageStateOrProvince")}
                      required
                      selectedValue={values.state}
                      formName="state"
                      onChange={(value) => {
                        setFieldValue("state", value);
                        setFieldTouched("state", true, false);
                      }}
                      errorMessage={touched.state && errors.state}
                    />
                  </div>

                  <div className="form-field-container">
                    <FormField
                      className="qa-zipcode input-container"
                      name="zip"
                      label={getString("zipCode")}
                      required
                      value={values.zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onInput={() => setFieldTouched("zip", true, false)}
                      renderCheckBox={
                        <Checkbox
                          qaTag="qa-po-box"
                          title={getString("thisAddressIsAPOBox") as string}
                          checked={values.isPoBox}
                          name="isPoBox"
                          onChange={() =>
                            setFieldValue("isPoBox", !values.isPoBox)
                          }
                        />
                      }
                      errorMessage={touched.zip && errors.zip}
                      errorRefs={errorRefs}
                    />
                    <FormField
                      className="qa-phone js-ship-phone input-container"
                      name="phone"
                      label={getString("phone")}
                      required
                      extraLabel={getString("tenDigits")}
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onInput={() => setFieldTouched("phone", true, false)}
                      errorMessage={touched.phone && errors.phone}
                      errorRefs={errorRefs}
                    />
                  </div>

                  { !enableAutoSaveShipAddress && (
                    <div className="form-footer form-footer__dual-button">
                      <Button
                        qaTag="qa-cancel"
                        label={getString("cancel") as string}
                        disabled={loading}
                        btnType="secondary"
                        onClick={onCancelClick}
                      />
                      <Button
                        qaTag="qa-submit"
                        disabled={loading}
                        label={getString("saveAndContinue") as string}
                        btnType="primary"
                        onClick={submitForm}
                      />
                    </div>
                  )}
                </Form>
              )}}
            </Formik>
          )}
        </div>
      </form>
      <AddressVerificationContainer
        ref={childRef}
        showAvs={showAVS}
        onClick={handleEditClick}
        onChangeShippingAddress={setShippingAddress}
        onSelectAddress={handleUseSelectedAddress}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default Checkout;
