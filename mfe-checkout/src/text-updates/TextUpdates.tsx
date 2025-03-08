import { Form, Formik, FormikHelpers } from "formik";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import * as Yup from "yup";
import { buildOrder } from "../api/service/Order";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ChangeOrder } from "../interfaces/ChangeOrder";
import { addressAtom, orderAtom } from "../store";
import "./TextUpdates.scss";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";

// Validation schema
const TextUpdatesSchema = Yup.object().shape({
  phone: Yup.string()
    .max(10, "Phone number must be exactly 10 digits")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  boxChecked: Yup.boolean(),
});

interface FormValues {
  phone: string;
  boxChecked: boolean;
}

export const TextUpdates = () => {
  const addresses = useAtomValue(addressAtom);
  const shippingAddress = addresses.find((address) => address.isShip);
  const [order, setOrder] = useAtom(orderAtom);

  const handleSendOrderUpdates = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const response = await buildOrder(
        generateChangeStoreResponse({
          ...order,
          userOptions: {
            ...order?.userOptions,
            smsPhone: values.boxChecked ? values.phone : "",
          },
        }) as ChangeOrder
      );

      if (!response.response.errors) {
        setOrder(response.response.success.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tm-container">
      <FormHeading title="Text Updates for this Order" />
      <div className="tm-rates-mobile">Message and data rates may apply.</div>
      <Formik
        initialValues={{
          phone: order?.userOptions.smsPhone || "",
          boxChecked: order?.userOptions.smsPhone ? true : false,
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
        }) => (
          <Form className="tm-form-container">
            <div>
              <FormField
                label={
                  (
                    <span className="form-field-label">Mobile Phone</span>
                  ) as any
                }
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
            <div className="save-for-later">
              <FormField
                type="checkbox"
                name="boxChecked"
                className="checkbox"
                checked={values.boxChecked}
                disabled={values.phone.length !== 10} // Disable if phone number is not 10 digits
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
        )}
      </Formik>
      <div className="tm-rates">Message and data rates may apply.</div>
    </div>
  );
};
