import { Form, Formik, FormikHelpers } from "formik";
import { useAtom } from "jotai";
import React, {useEffect, useState} from "react";
import * as Yup from "yup";
import { buildOrder } from "../api/service/Order";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { orderAtom } from "../store";
import "./TextUpdates.scss";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {customerApiData} from "../checkout/customerAtom";
import {fetchCustomerPreferenceData} from "../api/service/CommunicationPreferences";
import {siteApiData} from "../checkout/siteAtom";
import {SHOP_SHIP_UPDATE_TEXT_PREF_CODE} from "../interfaces/ShopperCommunicationPreferences";
import {fetchTwilioLookupData, PHONE_TYPE_MOBILE} from "../api/service/TwilioPhoneLookup";
import { getCountryName } from "../utils/helpers/LocaleHelper";

// Validation schema
const TextUpdatesSchema = Yup.object().shape({
  phone: Yup.string() //TODO: Keep in mind, this won't work for other countries. This is only valid for USA. Will need a better solution
    .max(10, "Phone number must be exactly 10 digits")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Mobile Phone is required"),
  boxChecked: Yup.boolean(),
});

interface FormValues {
  phone: string;
  boxChecked: boolean;
}

interface ITextUpdatesProps {
    pcid: string;
    siteId: string;
}

export const TextUpdates: React.FC<ITextUpdatesProps> = ({ pcid, siteId}) => {
  const [order, setOrder] = useAtom(orderAtom);

  const [siteData] = useAtom(siteApiData(siteId));
  const [customerData] = useAtom(customerApiData(pcid));
  const [customerProfileMobilePhone] = useState(customerData?.cell_phone || "");
  const [isAlertChecked, setIsAlertChecked] = useState(false);

    useEffect(() => {
        fetchCustomerPreferenceData(pcid, siteData).then((response) => {
            if (response) {
                const hasTextAlertsPreference = response.preferences.some(
                    (preference) => preference.preferenceCode === SHOP_SHIP_UPDATE_TEXT_PREF_CODE && preference.optIn === 1
                );
                setIsAlertChecked(hasTextAlertsPreference);

                if(hasTextAlertsPreference){
                    updateOrderWithTextAlerts(customerProfileMobilePhone);
                }
            }
        })
    }, []);

  const handleSendOrderUpdates = async (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikHelpers<FormValues>
  ) => {
    try {
        const phoneNumber = values.boxChecked ? values.phone : "";
        //mobile phone from customer profile should already be validated by twilio
        //if phone number has been changed, validate the phone before saving with the order
        if(phoneNumber.length && (phoneNumber !== customerProfileMobilePhone)){
            let isValidMobilePhone = true;
            fetchTwilioLookupData(phoneNumber, siteData).then((response) => {
                if (response) {
                    if(response.response?.carrier?.type?.toLowerCase() !== PHONE_TYPE_MOBILE){
                        //not a mobile phone
                        setFieldError("phone", "The phone number you entered is not a mobile phone number");
                        isValidMobilePhone = false;
                        values.boxChecked = false;
                        return;
                    } else if(response.response?.isMatch < 1) {
                        //mismatch country
                        const matchingCountryCode = response.response?.country_code;
                        const matchingCountryName = getCountryName(matchingCountryCode);
                        setFieldError("phone", `The mobile phone number you have entered is for ${matchingCountryName}. Please add a mobile phone number for ${getCountryName(siteData.locale.countryCode)} or leave empty.`);
                        isValidMobilePhone = false;
                        values.boxChecked = false;
                        return;
                    }
                    if(isValidMobilePhone){
                        updateOrderWithTextAlerts(phoneNumber);
                    }
                }
                else{
                    //not valid per twilio
                    setFieldError("phone", "The phone number entered is not valid");
                    isValidMobilePhone = false;
                    values.boxChecked = false;
                    return;
                }
            })
        } else {
            await updateOrderWithTextAlerts(phoneNumber);
        }

    } finally {
      setSubmitting(false);
    }
  };

    const updateOrderWithTextAlerts = async (
        phone: string
    ) => {
        if (order) {
            const response = await buildOrder(
                generateChangeStoreResponse({
                    ...order,
                    userOptions: {
                        ...order.userOptions,
                        smsPhone: phone,
                        smsMessageType: phone.length
                            ? "order-shipped"
                            : "",
                    },
                })
            );
            if (!response.response.errors) {
                setOrder(response.response.success.data);
            }
        }
    };

  return (
    <div className="tm-container">
      <FormHeading title="Text Updates for this Order" />
      <div className="tm-rates-mobile">Message and data rates may apply.</div>
        <Formik
            initialValues={{
                phone: customerProfileMobilePhone || "",
                boxChecked: isAlertChecked,
            }}
            enableReinitialize={true}
            validationSchema={TextUpdatesSchema}
            onSubmit={handleSendOrderUpdates}
        >
            {({
                  errors,
                  touched,
                  values,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  setFieldError,
              }) => {

                useEffect(() => {
                    //if text alerts is checked, we need to uncheck it when the phone number changes and remove the text alerts setting from the order
                    if(values.boxChecked){
                        setFieldValue("boxChecked", false);
                        setFieldError("phone", "");
                        updateOrderWithTextAlerts("");
                    }

                }, [values.phone, setFieldValue]);

                return (
                    <Form className="tm-form-container">
                      <div className={"qa-mobile-texts"}>
                            <FormField
                              qaTag={"qa-input"}
                                label={<span className="form-field-label">Mobile Phone</span>}
                                extraLabel="10 digits"
                                name="phone"
                                maxLength={10}
                                value={values.phone} // Controlled by Formik
                                required={values.boxChecked}
                                {...(values.boxChecked && {
                                    errorMessage: touched.phone && errors.phone,
                                })}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    // Allow only numbers (digits)
                                    const numericValue = e.target.value.replace(/\D/g, "");

                                    if (!numericValue) {
                                        setFieldValue("phone", "");
                                        setFieldValue("boxChecked", false);
                                    }
                                    handleChange({
                                        target: { name: "phone", value: numericValue },
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                onBlur={handleBlur}
                                errorMessage={touched.phone && errors.phone}
                            />
                        </div>
                        <div className={`save-for-later-txtupdate ${touched.phone && errors.phone ? "checkbox-custom":""}`}>
                            <FormField
                                type="checkbox"
                                name="boxChecked"
                                qaTag={"qa-checkbox"}
                                className={`checkbox  ${
                                    (values.phone || "").length !== 10 ? "disabled " : ""
                                 }`}
                                checked={values.boxChecked}
                                disabled={(values.phone || "").length !== 10} // Disable if phone number is not 10 digits
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    if (values.phone.length === 10) {
                                        handleChange(e);
                                        handleSubmit();
                                    }
                                }}
                                extraLabel="Send order updates"
                            />
                        </div>
                    </Form>
                );
            }}
        </Formik>
      <div className="tm-rates">Message and data rates may apply.</div>
    </div>
  );
};