import React from "react";
import "./CardInformation.scss";
import { FormField } from "../../component/Form/Field/FormField";

interface CardInformationProps {
  nameOnCard?: string;
  cardNumber?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv?: string;
  saveForLater?: boolean;
  sameAsShipping?: boolean;
  onChange?: (field: string, value: string | boolean) => void;
}

export const CardInformation: React.FC<CardInformationProps> = ({
  nameOnCard = "",
  cardNumber = "",
  expirationMonth = "",
  expirationYear = "",
  cvv = "",
  saveForLater = false,
  sameAsShipping = false,
  onChange,
}) => {
  const handleFieldChange = (field: string, value: string | boolean) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="card-information-container">
      <FormField
        label="Name on Card"
        required
        value={nameOnCard}
        onChange={(e) => handleFieldChange("nameOnCard", e.target.value)}
      />
      <FormField
        label="Card Number"
        required
        value={cardNumber}
        onChange={(e) => handleFieldChange("cardNumber", e.target.value)}
      />
      <div className="form-field-container">
        <FormField
          label="Expiration Month"
          value={expirationMonth}
          onChange={(e) => handleFieldChange("expirationMonth", e.target.value)}
        />
        <FormField
          label="Expiration Year"
          value={expirationYear}
          onChange={(e) => handleFieldChange("expirationYear", e.target.value)}
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="CVV"
          required
          extraLabel="3 or 4 digits"
          value={cvv}
          onChange={(e) => handleFieldChange("cvv", e.target.value)}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            checked={saveForLater}
            onChange={(e) =>
              handleFieldChange("saveForLater", e.target.checked)
            }
          />
          <span className="shipping-text">Save card for later</span>
        </div>
      </div>
      <div className="billing">
        <div className="billing-address">
          Billing Address
          <input
            className="checkbox"
            type="checkbox"
            checked={sameAsShipping}
            onChange={(e) =>
              handleFieldChange("sameAsShipping", e.target.checked)
            }
          />
        </div>
        <span className="shipping-text">Same as shipping</span>
      </div>
      <div className="checkbox-text">
        Ruby Boyle, 1 Lower Ragsdale Dr. Monterey, CA 93430
      </div>
    </div>
  );
};