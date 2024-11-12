import React from "react";
import { FormField } from "../../component/Form/Field/FormField";
import { ShopperSavedPayments } from "../../interfaces/ShopperSavedPayments";
import "./CardInformation.scss";

interface ICardInformationProps {
  initialData?: Partial<ShopperSavedPayments>;
  onCancel?: () => void;
}

export const CardInformation: React.FC<ICardInformationProps> = ({
  initialData,
  onCancel,
}) => {

  return (
    <div className="card-information-container">
      <FormField label="Name on Card" required value={initialData?.accountName as string} />
      <FormField
        label="Card Number"
        required
        value={initialData?.cardMask}
      />
      <div className="form-field-container">
        <FormField
          label="Expiration Month"
          value={initialData?.expirationDate?.slice(0, 2)}
        />
        <FormField
          label="Expiration Year"
          value={initialData?.expirationDate?.slice(-2)}
        />
      </div>
      <div className="form-field-container">
        <FormField label="CVV" required extraLabel="3 or 4 digits" />
        <div className="save-for-later">
          <input className="checkbox" type="checkbox" />
          <span onClick={onCancel} className="shipping-text">
            Save card for later
          </span>
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
