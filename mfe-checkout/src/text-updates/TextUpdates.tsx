import React, { useEffect, useState } from "react";
import "./TextUpdates.scss";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { FormField } from "../component/Form/Field/FormField";
import { useAtom, useAtomValue } from "jotai";
import { addressAtom, orderAtom } from "../store";
import { buildOrder } from "../api/service/Order";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ChangeOrder } from "../interfaces/ChangeOrder";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";

// Validation schema
const TextUpdatesSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Mobile Phone is required"),
  boxChecked: Yup.boolean().oneOf([true], "You must accept to receive updates"),
});

interface FormValues {
  phone: string;
  boxChecked: boolean;
}

export const TextUpdates = () => {
  const addresses = useAtomValue(addressAtom);
  const shippingAddress = addresses.find((address) => address.isShip);
  const [order, setOrder] = useAtom(orderAtom);

  useEffect(() => {
    // You can now remove phoneAddress state because Formik will handle the form state
  }, [shippingAddress]);

  const handleSendOrderUpdates = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const response = await buildOrder({
        ...order,
        userOptions: {
          ...order?.userOptions,
          smsPhone: values.boxChecked ? values.phone : "",
        },
      } as ChangeOrder);

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
      <Formik
        initialValues={{
          phone: shippingAddress?.phone || "",
          boxChecked: false,
        }}
        enableReinitialize={true} // This will reinitialize the form whenever `shippingAddress` changes
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
        }) => (
          <Form className="tm-form-container">
            <div>
              <FormField
                label="Mobile Phone"
                extraLabel="10 digits"
                name="phone"
                value={values.phone} // Controlled by Formik
                required={values.boxChecked}
                errorMessage={touched.phone && errors.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="save-for-later">
              <Field
                type="checkbox"
                name="boxChecked"
                className="checkbox"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  handleSubmit(); // Submit form when checkbox is toggled
                }}
              />
              <span className="shipping-text">Send order updates</span>
            </div>
          </Form>
        )}
      </Formik>
      <div className="tm-rates">Message and data rates may apply.</div>
    </div>
  );
};
