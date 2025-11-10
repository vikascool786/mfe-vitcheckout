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
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import { getCardType } from "../../utils/helpers/GetCardType";
import { getCreditCardSchema } from "../../validation/creditcardSchemas";
import "./CardInformation.scss";
import { CardInputs } from "./CardInputs";
import { getTypeIdByAltName, isThirdPartyPayment } from "../PaymentType";
import ScrollToError from "../../component/Form/ScrollToError/ScrollToError";
import {getShippingAddressFromAddressList} from "../../utils/AddressUtils";
import { CreditCardValidationWatcher } from "./CreditCardValidationWatcher";
import {siteApiData} from "../../checkout/siteAtom";
import { useContentStrings } from "../../hooks/useContentStrings";
import { getOrderNotifications } from "../../utils/OrderUtils";

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
  siteId: string;
  pcid: string;
  isGuest: boolean;
}

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
  siteId,
  pcid,
  isGuest,
}) => {
  const setLoading = useSetAtom(loadingAtom);
  const setOrderNotifications = useSetAtom(orderNotificationsAtom);
  const { getString } = useContentStrings();
  const errorRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [isCardSavedInWallet, setIsCardSavedInWallet] = useState(
    paymentMethod.id !== 0
  );

  const addressList = useAtomValue(addressAtom);

  const [saveCardToWallet, setSaveCardToWallet] = useState(true);

  const [cardError, setCardError] = useState<string | null>(null);

  const [paymentMethods] = useAtom(paymentMethodsAtom);
  const [order, setOrder] = useAtom(orderAtom);
  const [siteData] = useAtom(siteApiData(siteId));

  const shippingAddress = getShippingAddressFromAddressList(addressList, siteData.siteCountryCode);
  const [sameShippingAddress, setSameShippingAddress] = useState<boolean>(
    paymentMethod.id === 0
  );

  const validationSchema = Yup.object().shape({
    // Card Information Validation
    cardInfo: getCreditCardSchema(
      paymentMethod.id,
      getString as (key: string) => string
    ),

    // Conditionally apply address validation if sameShippingAddress is true
    ...(!sameShippingAddress
      ? {
          first: Yup.string()
            .required(getString("errFirstNameEmpty"))
            .max(30, getString("firstNameMax30Chars")),
          last: Yup.string()
            .required(getString("errLastNameRequired"))
            .max(30, getString("lastNameMax30Chars")),
          address1: Yup.string()
            .required(getString("addressRequired"))
            .max(200, getString("addressMax200Chars")),
          city: Yup.string()
            .required("City is required")
            .max(100, getString("cityNameExceeds100Characters")),
          state: Yup.string().required(getString("pcReg-errStateReq")),
          zip: Yup.string()
            .required(getString("hpPortalAdmin-errPostalReq"))
            .max(10, getString("zipCodeMaxLength")),
          phone: Yup.string()
            .required(getString("pleaseEnterPhoneNumber"))
            .matches(
              /^\+?[0-9\s()-]{7,15}$/,
              getString("invalidPhoneNumber")
          ),
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
    phone: address?.phone || "",
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
        }, pcid);
        const orderResponse = await buildOrder(updatedOrder);

        if (orderResponse?.response?.errors?.message) {
          setCardError(getString("unexpectedErrorTryAgain") as string);
          return;
        }

        updatedPaymentAddress = orderResponse.response.success.data
          .billingAddress as unknown as string;
        setOrder(orderResponse.response.success.data);
         if (orderResponse.response.success.notifications) {
          setOrderNotifications(
            getOrderNotifications(orderResponse.response.success)
          );
        }
        // updatePaymentValidationStatus(values.id as number);
        onCancel();
      }

      if (order) {
        setOrder({
          ...order,
          isOrderValid: false, //invalidate the order during cc edit, it will need to get revalidated when new cvv is entered
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
          isPaymentValidated: false, //card was edited so cvv needs to be re-validated
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

  const updateCardInformation = async (
    values: IPaymentMethod,
    address: Address,
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
      setCardError(getString("cardTypeNotAccepted") as string);
      setLoading(false);
      return;
    }

    if (typeId && !acceptablePaymentMethods?.includes(typeId)) {
      setCardError(getString("cardTypeNotAccepted") as string);
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
        if (values.id !== 0) {
          processCardUpdate(values, requestData, typeId as number);
          return;
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
        setError(`${getString("failedToLoadStates")}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchCountryAndStateData();
  }, []);

  if (loadingStates) {
    return <p>{getString("loadingStates")}...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        //onSubmit only for saving card edits
        //new card info submit will be handled by place order button - AI-110697
        onSubmit= {(values) => {
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
                phone: values.phone,
              }
              : (shippingAddress as Address);
          updateCardInformation(
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
          setFieldValue,
          submitForm,
        }) => {
          return (
            <form>
              <CreditCardValidationWatcher isValid={isValid} values={values} isShipSameAsBill={sameShippingAddress}
                                           shipAddress={shippingAddress} saveForLater={saveCardToWallet} country={siteData.siteCountryCode}/>
              <ScrollToError errorRefs={errorRefs} />
              <div className="card-information-container">
                <CardInputs
                    handleChange={handleChange}
                    touched={touched}
                    errors={errors}
                    onSubmit={submitForm}
                    handleBlur={handleBlur}
                    values={values}
                    isEditing={isEditing}
                    isEditingExistingCard={paymentMethod.id !== 0}
                    saveCardToWallet={saveCardToWallet}
                    setSaveCardToWallet={setSaveCardToWallet}
                    errorRefs={errorRefs}
                    isGuest={isGuest}
                />

                {addressList.length > 0 && paymentMethod.id < 1 && (
                    <div className="billing">
                      <span className="billing-text"> {getString("billingAddress")}</span>
                      <input
                          type="checkbox"
                          className="qa-same-shipping checkbox"
                          checked={sameShippingAddress}
                          onChange={() => {
                            setSameShippingAddress(!sameShippingAddress);
                          }}
                      />
                      <span>{getString("sameAsShipping")}</span>
                    </div>
                )}

                {addressList.length === 0 || !sameShippingAddress ? (
                    <form>
                      <div className="form-field-container">
                        <FormField
                            label={getString("firstName")}
                            required
                            name="first"
                            value={values.first}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            errorMessage={touched.first && errors.first}
                            errorRefs={errorRefs}
                        />
                        <FormField
                            label={getString("lastName")}
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
                            label={getString("addressLine1")}
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
                            label={getString("addressLine2")}
                            name="address2"
                            value={values.address2}
                            onChange={handleChange}
                            errorRefs={errorRefs}
                        />
                      </div>
                      <div className="form-field-container state-provinces">
                        <FormField
                            label={getString('city')}
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
                            label={getString("deliverDelayMessageStateOrProvince")}
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
                            label={getString("zipCode")}
                            required
                            name="zip"
                            value={values.zip}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            errorMessage={touched.zip && errors.zip}
                            errorRefs={errorRefs}
                        />
                        <FormField
                            label={getString("phone")}
                            required
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            errorMessage={touched.phone && errors.phone}
                            errorRefs={errorRefs}
                        />
                      </div>
                        <div className="save-for-later">
                          <input
                              className="checkbox"
                              type="checkbox"
                              name="isPoBox"
                              onChange={handleChange}
                          />
                          <span className="shipping-text">
                         {getString("thisAddressIsAPOBox")}
                        </span>
                        </div>
                    </form>
                ) : (
                    <div className="address-saved-text">
                      {shippingAddress?.first} {shippingAddress?.last},{" "}
                      {shippingAddress?.address1},{" "}
                      {shippingAddress?.address2 ? `${shippingAddress.address2}, ` : ""}
                      {shippingAddress?.city},{" "}
                      {shippingAddress?.state},{" "}
                      {shippingAddress?.zip}
                    </div>
                )}
                {cardError && <div className="error-message">{cardError}</div>}
                {isEditing && (
                    <div className="button-container">
                      <Button
                          qaTag="qa-cancel"
                          btnType="secondary"
                          label={getString('cancel') as string}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel();
                          }}
                      />
                      <Button
                          qaTag="qa-submit"
                          btnType="primary"
                          label={"Save"}
                          onClick={(e) => {
                            e.stopPropagation();
                            submitForm();
                          }}
                      />
                    </div>
                )}
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
