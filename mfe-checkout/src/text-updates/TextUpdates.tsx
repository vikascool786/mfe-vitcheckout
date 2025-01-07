import React from "react";
import "./TextUpdates.scss";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { FormField } from "../component/Form/Field/FormField";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";

export const TextUpdates = () => {
  return (
    <div className="tm-container">
      <FormHeading title="Text Updates for this Order" />
      <div className="tm-form-container">
        <FormField label="Mobile Phone" extraLabel="10 digits" required />
        <div className="save-for-later">
          <input className="checkbox" type="checkbox" />
          <span className="shipping-text">Send order updates</span>
        </div>
      </div>
      <div className="tm-rates">Message and data rates may apply.</div>
    </div>
  );
};
