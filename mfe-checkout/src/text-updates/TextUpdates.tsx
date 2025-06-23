import { Form, Formik, FormikHelpers, FormikErrors } from "formik";
import { useAtom } from "jotai";
import React, { SetStateAction, useEffect, useState, useCallback } from "react";
import * as Yup from "yup";
import { buildOrder } from "../api/service/Order";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { orderAtom } from "../store";
import "./TextUpdates.scss";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { customerApiData } from "../checkout/customerAtom";
import { fetchCustomerPreferenceData } from "../api/service/CommunicationPreferences";
import { siteApiData } from "../checkout/siteAtom";
import { SHOP_SHIP_UPDATE_TEXT_PREF_CODE } from "../interfaces/ShopperCommunicationPreferences";
import {
  fetchTwilioLookupData,
  PHONE_TYPE_MOBILE,
} from "../api/service/TwilioPhoneLookup";
import { getCountryName } from "../utils/helpers/LocaleHelper";
import { Back } from "../assets/svgs/Back";
import { INVALID_COUNTRY_MOBILE_NUMBER } from "../constant";
import { useContentStrings } from "../hooks/useContentStrings";

// Validation schema
interface FormValues {
  phone: string;
  boxChecked: boolean;
}

interface ITextUpdatesProps {
  pcid: string;
  siteId: string;
  mobileRequiredMessage: boolean;
  hasPhoneError?: boolean;
  setHasPhoneError: React.Dispatch<SetStateAction<boolean>>;
  setMobileRequiredMessage: React.Dispatch<SetStateAction<boolean>>;
}

// const TextUpdatesSchema = Yup.object({
//   phone: Yup.string().when("boxChecked", {
//     is: true,
//     then: (schema) =>
//       schema
//         .required("Mobile Phone is required")
//         .test(
//           "valid-phone-format",
//           "Phone number must contain exactly 10 digits",
//           function (value) {
//             const normalized = (value || "").replace(/\D/g, ""); // Remove non-digit characters
//             return /^\d{10}$/.test(normalized);
//           }
//         ),
//     otherwise: (schema) => schema.notRequired(),
//   }),
//   boxChecked: Yup.boolean(),
// });

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
    siteData,
    validateField,
    setHasPhoneError,
    setMobileRequiredMessage,
    mobileRequiredMessage,
    isSubmitting,
    isExpanded,
    toggleAccordion,
    getString,
  }: any) => {
    useEffect(() => {
      if (!values.boxChecked) return;

      const cleanedPhone = values.phone.replace(/\D/g, "");

      if (cleanedPhone.length === 10) {
        validateField("phone");
        setHasPhoneError(false);
        handleSubmit(); // always attempt Twilio validation when number becomes valid
      } else {
        setHasPhoneError(true);
      }
    }, [values.phone]);

    useEffect(() => {
      if (mobileRequiredMessage) {
        !errors.phone &&
          setFieldError("phone", getString("mobilePhoneRequired"));
      }
    }, [mobileRequiredMessage, setFieldError]);

    const handlePhoneChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^\d-]/g, ""); // allow digits and hyphens
        handleChange({
          target: { name: "phone", value: inputValue },
        } as React.ChangeEvent<HTMLInputElement>);

        const normalized = inputValue.replace(/\D/g, "");

        if (values.boxChecked && normalized.length === 10) {
          validateField("phone");
          setHasPhoneError(false);
          handleSubmit(); // ensure lookup is retried when value becomes valid
        }
      },
      [
        handleChange,
        values.boxChecked,
        setHasPhoneError,
        isSubmitting,
        validateField,
        handleSubmit,
      ]
    );

    const handleCheckboxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        if (!checked) {
          setFieldValue("phone", "");
          setFieldError("phone", "");
          setMobileRequiredMessage(false);
          setHasPhoneError(false);
        } else {
          values.phone.length !== 10 && setHasPhoneError(true);
          !isExpanded && toggleAccordion();
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
        isExpanded,
        toggleAccordion,
      ]
    );

    return (
      <Form className="tm-form-container">
        <div className="text-updates-header">
          <FormField
            type="checkbox"
            name="boxChecked"
            qaTag={"qa-checkbox"}
            className="checkbox"
            checked={values.boxChecked}
            onChange={handleCheckboxChange}
            extraLabel={getString("receiveTextMessage")}
          />
          <Back
            className={`qa-expand mfe-accordion ${
              isExpanded ? "open" : "close"
            }`}
            onClick={toggleAccordion}
            style={{
              pointerEvents: values.boxChecked ? "none" : "auto",
              opacity: values.boxChecked ? 0.5 : 1,
            }}
          />
        </div>

        {isExpanded && (
          <div className="text-updates-content">
            <div className="mobile-header">
              <span className="rates-text">
                Message and data rates may apply.
              </span>
            </div>
            <FormField
              qaTag={"qa-input"}
              label={
                <span className="mobile-label">{getString("mobilePhone")}</span>
              }
              name="phone"
              maxLength={14}
              value={values.phone}
              required={values.boxChecked}
              errorMessage={
                (values.boxChecked && touched.phone && errors.phone) ||
                (mobileRequiredMessage && errors.phone)
              }
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              extraLabel={getString("tenDigits")}
            />
          </div>
        )}
      </Form>
    );
  }
);

export const TextUpdates = React.memo(
  ({
    pcid,
    siteId,
    mobileRequiredMessage,
    hasPhoneError,
    setHasPhoneError,
    setMobileRequiredMessage,
  }: ITextUpdatesProps) => {
    const [order, setOrder] = useAtom(orderAtom);
    const [siteData] = useAtom(siteApiData(siteId));
    const [customerData] = useAtom(customerApiData(pcid));
    const { getString } = useContentStrings();
    const [customerProfileMobilePhone] = useState(
      customerData?.cell_phone || ""
    );
    const [isAlertChecked, setIsAlertChecked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [phoneErrorMessage, setPhoneErrorMessage] = useState<
      string | undefined
    >();

    useEffect(() => {
      fetchCustomerPreferenceData(pcid, siteData).then((response) => {
        if (response) {
          const hasTextAlertsPreference = response.preferences.some(
            (preference) =>
              preference.preferenceCode === SHOP_SHIP_UPDATE_TEXT_PREF_CODE &&
              preference.optIn === 1
          );
          setIsAlertChecked(hasTextAlertsPreference);
          setIsExpanded(hasTextAlertsPreference);
          if (hasTextAlertsPreference) {
            updateOrderWithTextAlerts(customerProfileMobilePhone);
          }
        }
      });
    }, []);

    useEffect(() => {
      if (mobileRequiredMessage || isAlertChecked) {
        setIsExpanded(true);
      }
    }, [mobileRequiredMessage, isAlertChecked]);
    const handleSendOrderUpdates = async (
      values: FormValues,
      { setSubmitting, setFieldError }: FormikHelpers<FormValues>
    ) => {
      try {
        setPhoneErrorMessage(undefined);
        let isValidMobilePhone = true;
        const phoneNumber = values.boxChecked
          ? (values.phone || "").replace(/\D/g, "")
          : "";

        if (values.boxChecked) {
          // Normalize customerProfileMobilePhone for comparison
          const normalizedCustomerPhone = customerProfileMobilePhone.replace(
            /\D/g,
            ""
          );
          if (
            phoneNumber.length === 10 &&
            phoneNumber !== normalizedCustomerPhone
          ) {
            fetchTwilioLookupData(phoneNumber, siteData).then((response) => {
              if (response) {
                if (
                  response.response?.carrier?.type?.toLowerCase() !==
                  PHONE_TYPE_MOBILE
                ) {
                  setFieldError("phone", getString("notAMobilePhoneNumber"));
                  setPhoneErrorMessage(getString("notAMobilePhoneNumber"));
                  setHasPhoneError(true);
                  isValidMobilePhone = false;
                  return;
                } else if (response.response?.isMatch < 1) {
                  const matchingCountryCode = response.response?.country_code;
                  const matchingCountryName =
                    getCountryName(matchingCountryCode);
                  setFieldError(
                    "phone",
                    INVALID_COUNTRY_MOBILE_NUMBER(
                      matchingCountryName as string,
                      getCountryName(siteData.locale.countryCode) as string,
                      getString
                    )
                  );
                  isValidMobilePhone = false;
                  setHasPhoneError(true);
                  setPhoneErrorMessage(
                    INVALID_COUNTRY_MOBILE_NUMBER(
                      matchingCountryName as string,
                      getCountryName(siteData.locale.countryCode) as string,
                      getString
                    )
                  );
                  return;
                }
                if (isValidMobilePhone) {
                  updateOrderWithTextAlerts(phoneNumber);
                  setHasPhoneError(false);
                }
              } else {
                setFieldError("phone", getString("invalidPhoneNumber"));
                setPhoneErrorMessage(getString("invalidPhoneNumber"));
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

    const toggleAccordion = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div className="tm-container">
        <Formik
          initialValues={{
            phone: customerProfileMobilePhone || "",
            boxChecked: isAlertChecked,
          }}
          enableReinitialize={true}
          validate={(values) => {
            const errors: FormikErrors<FormValues> = {};
            const normalized = values.phone.replace(/\D/g, "");
            if (values.boxChecked) {
              if (!normalized || normalized.length !== 10) {
                errors.phone = getString("phoneNumber10Digits");
              } 
              // do not block submission if number is now valid (Twilio will revalidate)
            }
            return errors;
          }}
          validateOnBlur={true}
          validateOnChange={false}
          validateOnMount={false}
          onSubmit={handleSendOrderUpdates}
        >
          {(formikProps) => (
            <FormContent
              {...formikProps}
              setHasPhoneError={setHasPhoneError}
              setMobileRequiredMessage={setMobileRequiredMessage}
              mobileRequiredMessage={mobileRequiredMessage}
              isExpanded={isExpanded}
              toggleAccordion={toggleAccordion}
              siteData={siteData}
              getString={getString}
            />
          )}
        </Formik>
      </div>
    );
  }
);
