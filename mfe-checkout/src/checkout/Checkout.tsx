import React from "react";
import "./Checkout.scss";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";

export const Checkout: React.FC = () => {
  return (
    <div className="form-container">
      <div className="form-header">
        <FormHeading title="Shipping Address" />
      </div>
      <div className="form-field-container">
        <FormField label="First Name" required />
        <FormField label="Last Name" required />
      </div>
      <div className="form-field-container-full">
        <FormField label="Address Line 1" required />
      </div>
      <div className="form-field-container-full">
        <FormField label="Address Line 2" />
      </div>
      <div className="form-field-container">
        <FormField label="City" required />
        <FormField label="Province" required />
      </div>

      <div className="form-field-container">
        <FormField
          label="Zip Code"
          required
          renderCheckBox={<Checkbox title="This address is a PO box" />}
        />
        <FormField
          label="Phone"
          required
          renderCheckBox={
            <Checkbox
              title="Get Text Updates for this Order"
              subtitle="Messaging data rates may apply."
            />
          }
        />
      </div>
      <div className="form-footer">
        <Button label="Save Shipping Address & Continue" type="primary" />
      </div>
    </div>
  );
};
