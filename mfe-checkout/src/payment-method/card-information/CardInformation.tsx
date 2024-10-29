import React from "react";
import "../../checkout/Checkout.scss";
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
        <Checkbox title="" />
      </div>
      <div>
        Billing Address <input type="checkbox"/> <span>Same as shipping</span> 
       <div className="checkbox-text">Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430</div>
      </div>
    </div>
  );
};
