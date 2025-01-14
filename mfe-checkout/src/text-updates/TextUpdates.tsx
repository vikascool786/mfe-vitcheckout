import React from "react";
import "./TextUpdates.scss";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { FormField } from "../component/Form/Field/FormField";
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import { changeOrder } from "../api/service/Order";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { ChangeOrder } from "../interfaces/ChangeOrder";

// Validation schema
const TextUpdatesSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Mobile Phone is required"),
  boxChecked: Yup.boolean().oneOf([true]),
});

export const TextUpdates = () => {
  const [order, setOrder] = useAtom(orderAtom);

  const handleSendOrderUpdates = (values: {
    phone: string;
    boxChecked: boolean;
  }) => {
    console.log(values);
    changeOrder(
      {
        ...order,
        userOptions: {
          ...order.userOptions,
          smsPhone: !values.boxChecked ? values.phone : "",
        },
      } as ChangeOrder,
      order.id
    ).then((response) => {
      if (!response.response.errors) {
        setOrder(response.response.success.data);
      }
    });
  };

  return (
    <div className="tm-container">
      <FormHeading title="Text Updates for this Order" />
      <Formik
        initialValues={{ phone: "", boxChecked: false }}
        validationSchema={TextUpdatesSchema}
        onSubmit={handleSendOrderUpdates}
      >
        {({ errors, touched, values, submitForm }) => (
          <Form className="tm-form-container">
            <div>
              <Field
                name="phone"
                render={({ field }: any) => (
                  <FormField
                    {...field}
                    label="Mobile Phone"
                    extraLabel="10 digits"
                    required={values.boxChecked}
                    errorMessage={touched.phone && errors.phone}
                  />
                )}
              />
            </div>
            <div className="save-for-later">
              <Field
                name="boxChecked"
                type="checkbox"
                className="checkbox"
                as="input"
                disabled={!values.phone.match(/^\d{10}$/)}
                onClick={() => handleSendOrderUpdates(values)}
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
