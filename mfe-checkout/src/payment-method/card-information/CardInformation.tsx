import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { buildOrder } from "../../api/service/Order";
import {
  addShoppersPaymentMethod,
  addTempPaymentMethod,
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
  loadingAtom,
  orderAtom,
  paymentMethodsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import "./CardInformation.scss";
import { Form, Formik, useFormik } from "formik";
import { createBlankAddress } from "../../utils/helpers/GenerateAddress";
import { AddressVerificationContainer } from "../../address-verification/AddressVerificationContainer";
import { AddressHandler } from "../../interfaces/AddressHandler";
import { useCreateShopperAddressBookEntry } from "../../api/service/ShopperAddressBook";
import { DropdownOption } from "../../interfaces/DropdownOption";
import { fetchStatesAndCountries } from "../../api/service/CountriesAndStates";

interface ICardInformationProps {
  paymentMethod: IPaymentMethod;
  isPaymentValidated: boolean;
  address: Address;
  shopperId: string;
  onCancel: () => void;
  onAddNewCard: (pm: IPaymentOption[]) => void;
  updatePaymentValidationStatus: (id: number) => void;
}

export const CardInformation: React.FC<ICardInformationProps> = ({
  updatePaymentValidationStatus,
  isPaymentValidated,
  paymentMethod,
  onAddNewCard,
  shopperId,
  address,
  onCancel,
}) => {
  const setLoading = useSetAtom(loadingAtom);
  const [isCardSavedInWallet, setIsCardSavedInWallet] = useState(
    paymentMethod.id !== 0
  );

  const { createShopperAddressBookEntry } = useCreateShopperAddressBookEntry();

  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const addressList = useAtomValue(addressAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress = addressList.find((add) => add.isShip);
  const [sameShippingAddress, setSameShippingAddress] = useState<boolean>(
    !address ? true : false
  );

  const validationSchema = Yup.object().shape({
    // Card Information Validation
    accountName: Yup.string().required("Name on Card is required"),
    number: Yup.string()
      .matches(
        /^(?:[0-9]{16}|[0-9]{6}\*{6}[0-9]{4})$/,
        "Card Number must be 16 digits"
      )
      .required("Card Number is required"),
    expMonth: Yup.number()
      .min(1, "Invalid month")
      .max(12, "Invalid month")
      .required("Expiration Month is required"),
    expYear: Yup.number()
      .min(new Date().getFullYear(), "Invalid year")
      .required("Expiration Year is required"),
    cvv: Yup.string()
      .matches(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits")
      .required("CVV is required"),

    // Conditionally validate address fields
    first: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema.required("First name is required")
    ),
    last: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema.required("Last name is required")
    ),
    address1: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema.required("Address Line 1 is required")
    ),
    city: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema.required("City is required")
    ),
    state: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema.required("State/Province is required")
    ),
    zip: Yup.string().when(
      "sameShippingAddress",
      (sameShippingAddress, schema) =>
        sameShippingAddress
          ? schema.notRequired()
          : schema
              .matches(/^\d{5}$/, "Zip code must be 5 digits")
              .required("Zip code is required")
    ),
  });

  const initialValues = {
    // Card Information Fields
    accountName: paymentMethod.accountName || "",
    number: paymentMethod.number || "",
    expMonth: paymentMethod.expMonth,
    expYear: paymentMethod.expYear,
    cvv: isPaymentValidated ? "***" : "",

    // Address Fields
    first: address.first || "",
    last: address.last || "",
    address1: address.address1 || "",
    address2: address.address2 || "",
    city: address.city || "",
    state: address.state || "",
    zip: address.zip || "",
  };

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
      ...shippingAddress,
      ...address,
      isBill: 1,
      id: 0,
    };

    setLoading(true);

    if (childRef.current) {
      try {
        const isValidAddress = await childRef.current.verifyAddress({
          ...addressEntered,
        });
        const validatedAddress = { ...addressEntered };

        setShowAVS(!isValidAddress);

        const addressParams = new URLSearchParams(
          Object.entries(validatedAddress as Address)
        ).toString();

        // Use POST request for new address (create)
        const response = await createShopperAddressBookEntry(
          shopperId,
          addressParams
        );
        setLoading(false);
        return response;
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
        return false;
      }
    }
  };

  const handleSaveCardInformation = async (
    values: IPaymentMethod,
    address: Address,
    type: "TEMP" | "WALLET",
    sameShippingAddress: boolean
  ) => {
    const newAddressToAdd = sameShippingAddress
      ? { ...shippingAddress, isUpdateEnabled: false }
      : {
          first: address?.first,
          last: address?.last,
          address1: address?.address1,
          address2: address?.address2 || "",
          city: address?.city || "New York",
          state: address?.state,
          zip: address?.zip,
          country: address?.country || "USA",
          phone: address?.phone || "",
          isPoBox: address?.isPoBox || false,
          isUpdateEnabled: false,
        };

    const newAddressResponse = sameShippingAddress
      ? shippingAddress?.id
      : await handleSaveAddress(newAddressToAdd as any);

    const requestData = {
      name: values.accountName,
      number: values.number,
      month: values.expMonth,
      year: values.expYear,
      preferred: values.preferred,
      type: 9,
      cvv: values.cvv,
      addressId: 0,
    };

    setLoading(true);

    if (!sameShippingAddress) {
      const newBillAddress = newAddressResponse.find(
        (address: Address) => address.isBill
      );
      if (newBillAddress) {
        requestData.addressId = newBillAddress.id;
      } else {
        requestData.addressId = shippingAddress?.id ? shippingAddress.id : 0;
      }
    } else {
      requestData.addressId = shippingAddress?.id || 0;
    }

    try {
      if (type === "WALLET") {
        if (values.id !== 0) {
          await updateShopperDetails(shopperId, values.id, requestData);
          if (order && values.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: values.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder(orderResponse.response.success.data);
          }
          updatePaymentValidationStatus(values.id as number);
          onCancel();
          setLoading(false);
          return;
        }

        try {
          const response = await addShoppersPaymentMethod(
            shopperId,
            requestData
          );
          const updatedPaymentMethods = [
            ...paymentMethods,
            {
              paymentMethod: {
                ...response.at(-1),
                cvv: requestData.cvv,
              },
              paymentAddress: sameShippingAddress ? shippingAddress : address,
              isSelected: true,
              isVisible: true,
              isEditing: false,
              isPaymentValidated: true,
            },
          ].filter((pm) => pm.paymentMethod?.id !== 0);

          if (order && paymentMethod) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: response.at(-1)?.id as number,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            onAddNewCard(updatedPaymentMethods as IPaymentOption[]);
            setOrder(orderResponse.response.success.data);
            setLoading(false);
          }
        } catch (error) {
          if (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error as string,
            });
            setLoading(false);

            return;
          }
        }
        onCancel();
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
              paymentAddress: sameShippingAddress ? shippingAddress : address,
              isTempPaymentMethod: true,
              isPaymentValidated: true,
              isSelected: true,
              isVisible: true,
            },
          ].filter((pm) => pm.paymentMethod.id !== 0);

          updatePaymentValidationStatus(updatedPaymentMethod.id);

          if (order && response.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: response.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            updatePaymentValidationStatus(response.id);
            setOrder(orderResponse.response.success.data);
          }

          setTimeout(() => {
            onAddNewCard(updatedPaymentMethods as IPaymentOption[]);
            setLoading(false);
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving card information:", error);
    }
  };

  const handleCancelNewCard = (values: IPaymentMethod) => {
    const isCancelWhileAddingNewCard = values.id === 0;

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

  const childRef = useRef<AddressHandler>(null);
  const [showAVS, setShowAVS] = useState(false);

  const handleUseSelectedAddress = () => {
    setShowAVS(!showAVS);
  };

  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );
  const [loadingStates, setLoadingStates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch states and countries on mount
  useEffect(() => {
    const fetchCountryAndStateData = async () => {
      setLoading(true);
      try {
        const response = await fetchStatesAndCountries("260");
        const stateList: DropdownOption[] = response.map((item: any) => ({
          label: item.description,
          value: item.regionID,
        }));
        setStateDropdownList(stateList);
      } catch (error) {
        setError("Failed to load state data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCountryAndStateData();
  }, []);

  if (loadingStates) {
    return <p>Loading states...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleEditClick = () => {
    setShowAVS(false);
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          const address = sameShippingAddress
            ? {
                first: values.first,
                last: values.last,
                address1: values.address1,
                address2: values.address2,
                city: values.city,
                state: values.state,
                zip: values.zip,
              }
            : (shippingAddress as Address);
          handleSaveCardInformation(
            {
              ...paymentMethod,
              accountName: values.accountName,
              number: values.number,
              expMonth: values.expMonth,
              expYear: values.expYear,
              cvv: parseInt(values.cvv),
              preferred: paymentMethod.preferred,
              id: paymentMethod.id,
            },
            address,
            isCardSavedInWallet ? "WALLET" : "TEMP",
            sameShippingAddress
          );
        }}
      >
        {({
          values,
          errors,
          touched,
          isValid,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          submitForm,
        }) => (
          <form>
            <div className="card-information-container">
              <FormField
                label="Name on Card"
                required
                name="accountName"
                value={values.accountName}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.accountName && errors.accountName}
              />
              <FormField
                label="Card Number"
                required
                name="number"
                value={values.number}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.number && errors.number}
              />
              <div className="form-field-container">
                <DropdownField
                  label="Expiration Month"
                  selectedValue={values.expMonth?.toString()}
                  options={[...Array(12)].map((_, i) => ({
                    value: (i + 1).toString().padStart(2, "0"),
                    label: (i + 1).toString().padStart(2, "0"),
                  }))}
                  onChange={(value) => handleChange("expMonth")(value)}
                  errorMessage={touched.expMonth && errors.expMonth}
                />
                <DropdownField
                  label="Expiration Year"
                  selectedValue={values.expYear?.toString()}
                  options={years}
                  onChange={(value) => handleChange("expYear")(value)}
                  errorMessage={touched.expYear && errors.expYear}
                />
              </div>
              <FormField
                label="CVV"
                required
                name="cvv"
                type="password"
                value={values.cvv}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.cvv && errors.cvv}
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
                  onChange={() => {
                    setSameShippingAddress(!sameShippingAddress);
                  }}
                />
                <span>Same as shipping</span>
              </div>

              {!sameShippingAddress ? (
                <form>
                  <div className="form-field-container">
                    <FormField
                      label="First Name"
                      required
                      name="first"
                      value={values.first}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.first && errors.first}
                    />
                    <FormField
                      label="Last Name"
                      required
                      name="last"
                      value={values.last}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.last && errors.last}
                    />
                  </div>
                  <div className="form-field-container-full">
                    <FormField
                      label="Address Line 1"
                      required
                      name="address1"
                      value={values.address1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.address1 && errors.address1}
                    />
                  </div>
                  <div className="form-field-container-full">
                    <FormField
                      label="Address Line 2"
                      name="address2"
                      value={values.address2}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field-container">
                    <FormField
                      label="City"
                      required
                      name="city"
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
                      onChange={(e) => setFieldValue("state", e)}
                      errorMessage={touched.state && errors.state}
                    />
                  </div>
                  <div className="form-field-container">
                    <FormField
                      label="Zip Code"
                      required
                      name="zip"
                      value={values.zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={touched.zip && errors.zip}
                    />
                    <div className="save-for-later">
                      <input
                        className="checkbox"
                        type="checkbox"
                        name="isPoBox"
                        onChange={handleChange}
                      />
                      <span className="shipping-text">
                        This address is a PO box
                      </span>
                    </div>
                  </div>
                </form>
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
                    handleCancelNewCard({
                      ...paymentMethod,
                      accountName: values.accountName,
                      number: values.number,
                      expMonth: values.expMonth,
                      expYear: values.expYear,
                      cvv: parseInt(values.cvv),
                    });
                  }}
                />
                <Button
                  btnType="primary"
                  label={isCardSavedInWallet ? "Update" : "Save"}
                  onClick={submitForm}
                />
              </div>
            </div>
          </form>
        )}
      </Formik>
      <AddressVerificationContainer
        ref={childRef}
        showAvs={showAVS}
        onClick={handleEditClick}
        onSelectAddress={handleUseSelectedAddress}
      />
    </>
  );
};
