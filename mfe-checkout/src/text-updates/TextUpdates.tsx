import { Form, Formik, FormikHelpers } from "formik";
import { useAtom } from "jotai";
import React, { SetStateAction, useEffect, useState, useCallback } from "react";
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
interface FormValues {
  phone: string;
  boxChecked: boolean;
}

interface ITextUpdatesProps {
  pcid: string;
  siteId: string;
  mobileRequiredMessage: boolean;
  setHasPhoneError: React.Dispatch<SetStateAction<boolean>>;
  setMobileRequiredMessage: React.Dispatch<SetStateAction<boolean>>;
}

const TextUpdatesSchema = Yup.object().shape({
  phone: Yup.string()
    .when("boxChecked", {
      is: true,
      then: (schema) =>
        schema
          .required("Mobile Phone is required")
          .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
      otherwise: (schema) => schema.notRequired(),
    })
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  boxChecked: Yup.boolean(),
});

const FormContent = React.memo(
  ({
    errors,
    touched,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setHasPhoneError,
    setMobileRequiredMessage,
    mobileRequiredMessage,
    isSubmitting,
  }: any) => {
    useEffect(() => {
      if (values.boxChecked && values.phone.length === 10) {
        handleSubmit();
      }
    }, [values.phone]);

    useEffect(() => {
      if (mobileRequiredMessage) {
        !errors.phone && setFieldError("phone", "Mobile Phone is required");
      }
    }, [mobileRequiredMessage, setFieldError]);

    const handlePhoneChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/\D/g, "");
        handleChange({
          target: { name: "phone", value: numericValue },
        } as React.ChangeEvent<HTMLInputElement>);

        if (values.boxChecked && numericValue.length === 10) {
          setHasPhoneError(false);
        }
      },
      [handleChange, values.boxChecked, setHasPhoneError, isSubmitting]
    );

    const handleCheckboxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        const phoneValue = values.phone;
        if (!checked) {
          setFieldValue("phone", "");
          setFieldError("phone", "");
          setMobileRequiredMessage(false);
          setHasPhoneError(false);
        } else {
          values.phone.length !== 10 && setHasPhoneError(true);
        }
        handleChange(e);
        handleSubmit();
      },
      [
        values.phone,
        setFieldValue,
        setFieldError,
        setMobileRequiredMessage,
        setHasPhoneError,
        handleChange,
      ]
    );

    return (
      <Form className="tm-form-container">
        <div className={"qa-mobile-texts"}>
          <FormField
            qaTag={"qa-input"}
            label={<span className="form-field-label">Mobile Phone</span>}
            extraLabel="10 digits"
            name="phone"
            maxLength={10}
            value={values.phone}
            required={values.boxChecked}
            errorMessage={
              (values.boxChecked && touched.phone && errors.phone) ||
              (mobileRequiredMessage && errors.phone)
            }
            onChange={handlePhoneChange}
            onBlur={handleBlur}
          />
        </div>
        <div className="save-for-later-txtupdate">
          <FormField
            type="checkbox"
            name="boxChecked"
            qaTag={"qa-checkbox"}
            className="checkbox"
            checked={values.boxChecked}
            onChange={handleCheckboxChange}
            extraLabel="Send order updates"
          />
        </div>
      </Form>
    );
  }
);

export const TextUpdates = React.memo(
  ({
    pcid,
    siteId,
    mobileRequiredMessage,
    setHasPhoneError,
    setMobileRequiredMessage,
  }: ITextUpdatesProps) => {
    const [order, setOrder] = useAtom(orderAtom);
    const [siteData] = useAtom(siteApiData(siteId));
    const [customerData] = useAtom(customerApiData(pcid));
    const [customerProfileMobilePhone] = useState(
      customerData?.cell_phone || ""
    );
    const [isAlertChecked, setIsAlertChecked] = useState(false);

    useEffect(() => {
      fetchCustomerPreferenceData(pcid, siteData).then((response) => {
        if (response) {
          const hasTextAlertsPreference = response.preferences.some(
            (preference) =>
              preference.preferenceCode === SHOP_SHIP_UPDATE_TEXT_PREF_CODE &&
              preference.optIn === 1
          );
          setIsAlertChecked(hasTextAlertsPreference);

          if (hasTextAlertsPreference) {
            updateOrderWithTextAlerts(customerProfileMobilePhone);
          }
        }
      });
    }, []);

    const handleSendOrderUpdates = async (
      values: FormValues,
      { setSubmitting, setFieldError }: FormikHelpers<FormValues>
    ) => {
      try {
        const phoneNumber = values.boxChecked ? values.phone : "";

        if (values.boxChecked) {
          if (
            phoneNumber.length &&
            phoneNumber.length === 10 &&
            phoneNumber !== customerProfileMobilePhone
          ) {
            let isValidMobilePhone = true;
            fetchTwilioLookupData(phoneNumber, siteData).then((response) => {
              if (response) {
                if (
                  response.response?.carrier?.type?.toLowerCase() !==
                  PHONE_TYPE_MOBILE
                ) {
                  setFieldError(
                    "phone",
                    "The phone number you entered is not a mobile phone number"
                  );
                  setHasPhoneError(true);
                  isValidMobilePhone = false;
                  return;
                } else if (response.response?.isMatch < 1) {
                  const matchingCountryCode = response.response?.country_code;
                  const matchingCountryName =
                    getCountryName(matchingCountryCode);
                  setFieldError(
                    "phone",
                    `The mobile phone number you have entered is for ${matchingCountryName}. Please add a mobile phone number for ${getCountryName(
                      siteData.locale.countryCode
                    )} or leave empty.`
                  );
                  isValidMobilePhone = false;
                  setHasPhoneError(true);
                  return;
                }
                if (isValidMobilePhone) {
                  updateOrderWithTextAlerts(phoneNumber);
                  setHasPhoneError(false);
                }
              } else {
                setFieldError("phone", "The phone number entered is not valid");
                setHasPhoneError(true);
                isValidMobilePhone = false;
                return;
              }
            });
          }
        } else {
          await updateOrderWithTextAlerts("");
        }
      } finally {
        setSubmitting(false);
      }
    };

    const updateOrderWithTextAlerts = async (phone: string) => {
      if (order) {
        const response = await buildOrder(
          generateChangeStoreResponse({
            ...order,
            userOptions: {
              ...order.userOptions,
              smsPhone: phone,
              smsMessageType: phone.length ? "order-shipped" : "",
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
          {(formikProps) => (
            <FormContent
              {...formikProps}
              setHasPhoneError={setHasPhoneError}
              setMobileRequiredMessage={setMobileRequiredMessage}
              mobileRequiredMessage={mobileRequiredMessage}
            />
          )}
        </Formik>
      </div>
    );
  }
);
