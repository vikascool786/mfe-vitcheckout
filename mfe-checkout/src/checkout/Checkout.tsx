import React, { useRef, useState } from "react";
import "./Checkout.scss";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { FormField } from "../component/Form/Field/FormField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Back } from "../assets/svgs/Back";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { AddressHandler } from "../interfaces/AddressHandler";

export const Checkout: React.FC = () => {
  // State to manage whether the form is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const childRef = useRef<AddressHandler>(null);

  const handleSaveAddress = () => {
    if (childRef.current) {
      childRef.current.verifyAddress();
    }
  };

  return (
    <div>
      <div className="form-container">
        <div className="form-header">
          <FormHeading title="Shipping Address" />
          <Back
            className={`accordion ${isExpanded ? "open" : "close"}`}
            onClick={toggleAccordion}
          />
        </div>

        {/* show details fields based on accordion state close  */}
        {!isExpanded && (
          <div className="shipping-address">Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430</div>
        )}

        {/* Conditionally render form fields based on accordion state */}
        {isExpanded && (
          <>
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
                extraLabel="10 digits"
                renderCheckBox={
                  <Checkbox
                    title="Get Text Updates for this Order"
                    subtitle="Messaging data rates may apply."
                  />
                }
              />
            </div>
            <div className="form-footer">
              <Button label="Save Shipping Address & Continue" type="primary" onClick={() => handleSaveAddress()} />
            </div>
          </>
        )}
      </div>
      <AddressVerificationContainer ref={childRef} />
    </div>
  );
};