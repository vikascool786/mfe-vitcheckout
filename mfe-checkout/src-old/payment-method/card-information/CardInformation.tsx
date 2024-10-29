import React from "react";
import "./CardInformation.scss";
import { FormField } from "../../component/Form/Field/FormField";
import { Checkbox } from "../../component/Form/Checkbox/Checkbox";

export const CardInformation = () => {
  return (
    <div className="card-information-container">
      <FormField label="Name on Card" required />
      <FormField label="Card Number" required />
      <div className="form-field-container">
        <FormField label="Expiration Month" />
        <FormField label="Expiration Year" />
      </div>
      <div className="form-field-container">
        <FormField label="CVV" required extraLabel="3 or 4 digits" />
        <div className="save-for-later">
          <input className="checkbox" type="checkbox" />
          <span className="shipping-text">Save card for later</span>
        </div>
      </div>
      <div className="billing">
        <div className="billing-address">
          Billing Address <input className="checkbox" type="checkbox" />
        </div>
        <span className="shipping-text">Same as shipping</span>
      </div>
      <div className="checkbox-text">
        Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430
      </div>
    </div>
  );
};
