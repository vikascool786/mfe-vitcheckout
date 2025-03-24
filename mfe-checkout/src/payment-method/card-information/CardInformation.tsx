import { Formik } from "formik";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { fetchStatesAndCountries } from "../../api/service/CountriesAndStates";
import { buildOrder } from "../../api/service/Order";
import {
  addShoppersPaymentMethod,
  addTempPaymentMethod,
  generateCardToken,
  updateShopperDetails,
  updateTempPaymentMethod,
} from "../../api/service/ShoppersPaymentMethods";
import { Button } from "../../component/Button/Button";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { AddressHandler } from "../../interfaces/AddressHandler";
import { DropdownOption } from "../../interfaces/DropdownOption";
import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import {
  addressAtom,
  IPaymentOption,
  loadingAtom,
  orderAtom,
  paymentMethodsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { getCardType } from "../../utils/helpers/GetCardType";
import { getCreditCardSchema } from "../../validation/creditcardSchemas";
import "./CardInformation.scss";
import { CardInputs } from "./CardInputs";
import { getTypeIdByAltName, isThirdPartyPayment } from "../PaymentType";
import ScrollToError from "../../component/Form/ScrollToError/ScrollToError";

interface ICardInformationProps {
  paymentMethod: IPaymentMethod;
  isPaymentValidated: boolean;
  address: Address;
  shopperId: string;
  onCancel: () => void;
  onAddNewCard: (pm: IPaymentOption[]) => void;
  updatePaymentValidationStatus: (id: number) => void;
  setCVVFieldValue: any;
  isEditing: boolean;
  isTempPaymentMethod?: boolean;
}

const CARD_MAP = new Map([
  ["mastercard", "https://img.shop.com/Image/local/images/cc/mastercard.png"],
  ["visa", "https://img.shop.com/Image/local/images/cc/visa.jpg"],
  ["discover", "https://img.shop.com/Image/local/images/cc/discover.png"],
  ["american express", "https://img.shop.com/Image/local/images/cc/amex.png"],
  ["diners club", "https://img.shop.com/Image/local/images/cc/diners.png"],
  ["jcb", "https://img.shop.com/Image/local/images/cc/jcb.png"],
]);

export const CardInformation: React.FC<ICardInformationProps> = ({
  updatePaymentValidationStatus,
  setCVVFieldValue,
  paymentMethod,
  onAddNewCard,
  shopperId,
  address,
  onCancel,
  isTempPaymentMethod,
  isEditing = false,
}) => {
  const setLoading = useSetAtom(loadingAtom);

  const errorRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [isCardSavedInWallet, setIsCardSavedInWallet] = useState(
    paymentMethod.id !== 0
  );

  const addressList = useAtomValue(addressAtom);

  const [saveCardToWallet, setSaveCardToWallet] = useState(true);

  const [cardError, setCardError] = useState<string | null>(null);

  const [paymentMethods] = useAtom(paymentMethodsAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress =
    addressList.find((address) => address.isShip || address.isPrimary) ??
    addressList.find((address) => address.hasAddress);
  const [sameShippingAddress, setSameShippingAddress] = useState<boolean>(
    paymentMethod.id === 0
  );

  const validationSchema = Yup.object().shape({
    // Card Information Validation
    cardInfo: getCreditCardSchema(paymentMethod.id),

    // Conditionally apply address validation if sameShippingAddress is true
    ...(!sameShippingAddress
      ? {
        first: Yup.string()
          .required("First name is required")
          .max(30, "First name cannot exceed 30 characters."),
        last: Yup.string()
          .required("Last name is required")
          .max(30, "Last name cannot exceed 30 characters."),
        address1: Yup.string()
          .required("Address is required")
          .max(200, "Address cannot exceed 200 characters."),
        city: Yup.string()
          .required("City is required")
          .max(100, "City name cannot exceed 100 characters."),
        state: Yup.string().required("State is required"),
        zip: Yup.string()
          .required("Please enter your zip code")
          .max(10, "Zip code cannot exceed 10 characters."),
      }
      : {}),
  });

  const initialValues = {
    // Card Information Fields
    cardInfo: {
      accountName: paymentMethod.accountName || "",
      number: paymentMethod.number || "",
      expMonth: paymentMethod.expMonth,
      expYear: paymentMethod.expYear,
      cvv: "",
    },

    // Address Fields
    first: address?.first || "",
    last: address?.last || "",
    address1: address?.address1 || "",
    address2: address?.address2 || "",
    city: address?.city || "",
    state: address?.state || "",
    zip: address?.zip || "",
  };

  const processCardUpdate = async (
    values: IPaymentMethod,
    requestData: any,
    typeID: number
  ) => {
    setLoading(true);
    try {
      let updatedPaymentAddress: string = "";
      const response = await updateShopperDetails(
        shopperId,
        values.id,
        requestData
      );
      const updatedMethod = response.data.find(
        (mthd: IPaymentMethod) => mthd.id === values.id
      );

      // Separate the updated payment method and move it to the top
      const otherMethods = paymentMethods.filter(
        (pm) => pm.paymentMethod.id !== values.id
      );

      // Ensure the updated payment method is selected, visible, and validated

      if (order && values.id) {
        const updatedOrder = generateChangeStoreResponse({
          ...order,
          billingAddress: {
            ...order.billingAddress,
            id: updatedMethod.addressId as number,
          },
          paymentMethod: {
            ...order.paymentMethod,
            typeID,
            id: values.id,
          },
        });
        const orderResponse = await buildOrder(updatedOrder);

        if (orderResponse.response.errors.message) {
          setCardError("Something went wrong. Please try again.");
          return;
        }

        updatedPaymentAddress = orderResponse.response.success.data
          .billingAddress as unknown as string;
        setOrder(orderResponse.response.success.data);
        // updatePaymentValidationStatus(values.id as number);
        onCancel();
      }

      if (order) {
        setOrder({
          ...order,
          isOrderValid: true,
        });
      }

      setLoading(false);

      const updatedPaymentMethods = [
        {
          paymentAddress: updatedPaymentAddress,
          paymentMethod: {
            ...updatedMethod,
          },
          isEditing: false,
          isSelected: true,
          isVisible: true,
          isPaymentValidated: true,
        },
        ...otherMethods.map((pm) => ({
          ...pm,
          paymentMethod: {
            ...pm.paymentMethod,
            preferred: false,
          },

          isSelected: false,
          isEditing: false,
          isPaymentValidated: false, // Reset validation for other cards
        })),
      ];

      onAddNewCard(updatedPaymentMethods as IPaymentOption[]);
      // onCancel();
    } catch (error: any) {
      setCardError(error?.response?.data);
      onAddNewCard(paymentMethods as IPaymentOption[]);
    } finally {
      setLoading(false);
      const section = document.getElementById("pm-main");
      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  };

  const handleSaveCardInformation = async (
    values: IPaymentMethod,
    address: Address,
    type: "TEMP" | "WALLET",
    sameShippingAddress: boolean
  ) => {
    setLoading(true);

    // if value is 0, item means it is a new card else old card is being edited
    const typeId =
      values.id !== 0
        ? values.typeID
        : getTypeIdByAltName(getCardType(values.number).toLowerCase());

    // check if paymentMethods accept the particular card type

    const acceptablePaymentMethods = order?.paymentMethods
      .filter((pm) => pm.typeID === typeId)
      .map((pm) => pm.typeID);
    if (acceptablePaymentMethods?.length === 0) {
      setCardError("This card type is not accepted");
      setLoading(false);
      return;
    }

    if (typeId && !acceptablePaymentMethods?.includes(typeId)) {
      setCardError("This card type is not accepted");
      setLoading(false);
      return;
    }

    // create payload for api
    let requestData: any = {
      name: values.accountName,
      ...(paymentMethod.id === 0
        ? { number: values.number, cvv: values.cvv }
        : {}),
      number: values.number,
      month: values.expMonth,
      year: values.expYear,
      preferred: true,
      type: typeId,
    };

    // if same as put shipping address id
    if (sameShippingAddress) {
      requestData = {
        ...requestData,
        addressId: shippingAddress?.id,
      };
    } else {
      requestData = {
        ...requestData,
        ...address,
      };
    }

    try {
      if (type === "WALLET") {
        // if we are editing the card
        if (values.id !== 0) {
          processCardUpdate(values, requestData, typeId as number);
          return;
        }

        // we are adding a new card
        const cardTokenResponse = await generateCardToken(requestData.number);
        const token = cardTokenResponse?.token.id;
        const number = cardTokenResponse?.token.mask;
        setCVVFieldValue(values.cvv);
        // api call to add card into the user's wallet
        const response = await addShoppersPaymentMethod(shopperId, {
          ...requestData,
          token,
          number,
        });

        // since we do not have id for the card we are adding newly,
        // we add the last card in the response to the payment methods
        const updatedPaymentMethods = [
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
          ...paymentMethods.map((pm) => ({
            ...pm,
            paymentMethod: {
              ...pm.paymentMethod,
              preferred: false,
            },
            isSelected: false,
            isPaymentValidated: false,
            isVisible: isThirdPartyPayment(pm.paymentMethod.typeID),
          })),
        ].filter((pm) => pm.paymentMethod?.id !== 0);

        //update the order with the newly added payment method
        if (order && paymentMethod) {
          const updatedOrder = generateChangeStoreResponse({
            ...order,
            billingAddress: {
              ...order.billingAddress,
              id: response.at(-1)?.addressId as number,
            },
            paymentMethod: {
              ...order.paymentMethod,
              id: response.at(-1)?.id as number,
            },
          });

          // build the order to sync with the cart api
          const orderResponse = await buildOrder(updatedOrder);

          onAddNewCard(updatedPaymentMethods as IPaymentOption[]);
          setOrder({
            ...orderResponse.response.success.data,
            isOrderValid: true,
          });
          setLoading(false);
        }
      } else if (type === "TEMP") {
        const cardTokenResponse = await generateCardToken(requestData.number);
        const imageUrl =
        values.id === 0
          ? CARD_MAP.get(getCardType(requestData.number).toLowerCase())
          : values.imageUrl;

        const token = cardTokenResponse?.token.id;
        const number = cardTokenResponse?.token.mask;

        const response =
          token && number
            ? await addTempPaymentMethod(shopperId, {
              ...requestData,
              token,
              number,
            })
            : await updateTempPaymentMethod(shopperId, requestData);

        if (response) {
          const updatedPaymentMethod = {
            ...(response as IPaymentMethod),
          };

          const updatedPaymentMethods = [
            {
              paymentMethod: {
                ...updatedPaymentMethod,
                imageUrl,
                cvv: requestData.cvv,
              },
              paymentAddress: sameShippingAddress ? shippingAddress : address,
              isTempPaymentMethod: true,
              isPaymentValidated: true,
              isSelected: true,
              isVisible: true,
            },
            ...paymentMethods.map((pm) => ({
              ...pm,
              paymentMethod: {
                ...pm.paymentMethod,
                preferred: false,
              },
              isPaymentValidated: false,
              isSelected: false,
              isVisible: isThirdPartyPayment(pm.paymentMethod.typeID),
            })),
          ].filter((pm) => pm.paymentMethod.id !== 0);

          setCVVFieldValue(values.cvv);

          if (order && response.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              billingAddress: {
                ...order.billingAddress,
                id: response?.addressId as number,
              },
              paymentMethod: {
                ...order.paymentMethod,
                id: response.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder({
              ...orderResponse.response.success.data,
              isOrderValid: true,
            });
          }

          onAddNewCard(updatedPaymentMethods as IPaymentOption[]);
          setLoading(false);
        }

        setCardError("Error while adding card");
      }
    } catch (error: any) {
      if (order) {
        setOrder({
          ...order,
          isOrderValid: false,
        });
      }
      setLoading(false);
      setCardError(error?.response?.data);
    } finally {
      const section = document.getElementById("pm-main");
      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
      setLoading(false);
    }
  };

  const childRef = useRef<AddressHandler>(null);

  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );
  const [loadingStates, setLoadingStates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      paymentMethods.find((pm) => pm.paymentMethod.id === paymentMethod.id)
        ?.isTempPaymentMethod
    ) {
      setSaveCardToWallet(false);
    }
  }, [paymentMethods]);
  
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

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          setCardError(null);
          const address = !sameShippingAddress
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
              accountName: values.cardInfo.accountName,
              number: values.cardInfo.number,
              expMonth: values.cardInfo.expMonth,
              expYear: values.cardInfo.expYear,
              cvv: parseInt(values.cardInfo.cvv),
              preferred: paymentMethod.preferred,
              id: paymentMethod.id,
            },
            address,
            saveCardToWallet ? "WALLET" : "TEMP",
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
        }) => {
          return (
            <form>
              <ScrollToError errorRefs={errorRefs} />
              <div className="card-information-container">
                <CardInputs
                  handleChange={handleChange}
                  touched={touched}
                  errors={errors}
                  handleBlur={handleBlur}
                  values={values}
                  isEditing={isEditing}
                  isEditingExistingCard={paymentMethod.id !== 0}
                  saveCardToWallet={saveCardToWallet}
                  setSaveCardToWallet={setSaveCardToWallet}
                  errorRefs={errorRefs}
                />
                
                {addressList.length > 0 && paymentMethod.id < 1 && (
                  <div className="billing">
                    <span className="billing-text">Billing Address</span>
                    <input
                      type="checkbox"
                      className="qa-same-shipping checkbox"
                      checked={sameShippingAddress}
                      onChange={() => {
                        setSameShippingAddress(!sameShippingAddress);
                      }}
                    />
                    <span>Same as shipping</span>
                  </div>
                )}

                {addressList.length === 0 || !sameShippingAddress ? (
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
                        errorRefs={errorRefs}
                      />
                      <FormField
                        label="Last Name"
                        required
                        name="last"
                        value={values.last}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={touched.last && errors.last}
                        errorRefs={errorRefs}
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
                        errorRefs={errorRefs}
                      />
                    </div>
                    <div className="form-field-container-full">
                      <FormField
                        label="Address Line 2"
                        name="address2"
                        value={values.address2}
                        onChange={handleChange}
                        errorRefs={errorRefs}
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
                        errorRefs={errorRefs}
                      />
                      <DropdownField
                        options={stateDropdownList}
                        label="State/Province"
                        required
                        selectedValue={values.state}
                        formName="state"
                        onChange={(e) => setFieldValue("state", e)}
                        errorMessage={touched.state && errors.state}
                        errorRefs={errorRefs}
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
                        errorRefs={errorRefs}
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
                  <div className="address-saved-text">
                    {shippingAddress?.first} {shippingAddress?.last}{" "}
                    {shippingAddress?.address1}
                    {shippingAddress?.address2} {shippingAddress?.city}{" "}
                    {shippingAddress?.zip}
                  </div>
                )}
                {cardError && <div className="error-message">{cardError}</div>}
                <div className="button-container">
                  <Button
                    qaTag="qa-submit"
                    btnType="primary"
                    label={"Save Card Changes"}
                    onClick={(e) => {
                      e.stopPropagation();
                      submitForm();
                    }}
                  />
                  <Button
                    qaTag="qa-cancel"
                    btnType="secondary"
                    label="Cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel();
                    }}
                  />
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
