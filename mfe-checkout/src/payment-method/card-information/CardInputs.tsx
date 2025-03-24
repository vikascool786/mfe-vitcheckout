import React from "react";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import "./CardInformation.scss";

interface ICardInputProps {
  touched: any;
  errors: any;
  handleChange: any;
  values: any;
  handleBlur: any;
  isEditingExistingCard: boolean;
  saveCardToWallet: boolean;
  setSaveCardToWallet: any;
  isEditing: boolean;
  errorRefs?: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null;
  }> | null;
}

export const CardInputs: React.FC<ICardInputProps> = ({
  touched,
  errors,
  handleChange,
  values,
  handleBlur,
  isEditingExistingCard,
  saveCardToWallet,
  setSaveCardToWallet,
  isEditing = false,
  errorRefs = null,
}) => {
  const getYears = (startYear: number, endYear: number) =>
    Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: `${startYear + i}`,
      label: `${startYear + i}`,
    }));

  const currentYear = new Date().getFullYear();
  const years = getYears(currentYear, currentYear + 10);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formattedValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (formattedValue.length > 16)
      formattedValue = formattedValue.slice(0, 16); // Restrict to 16 digits

    handleChange("cardInfo.number")(formattedValue);
  };

  console.log(values);

  return (
    <>
      {!isEditing && (
        <FormField
          qaTag="qa-name"
          label="Name on Card"
          required
          name="cardInfo.accountName"
          value={values.cardInfo?.accountName || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={
            touched.cardInfo?.accountName && errors.cardInfo?.accountName
          }
          errorRefs={errorRefs}
        />
      )}
      {!isEditing && (
        <FormField
          qaTag="qa-card-number"
          label="Card Number"
          required
          name="cardInfo.number"
          value={values.cardInfo?.number || ""}
          onChange={handleCardNumberChange}
          onBlur={handleBlur}
          errorMessage={touched.cardInfo?.number && errors.cardInfo?.number}
          errorRefs={errorRefs}
        />
      )}
      <div className="form-field-container">
        <DropdownField
          qaTag="qa-expiration-month"
          className="form-field-half"
          required
          label="Expiration Month"
          formName="cardInfo.expMonth"
          selectedValue={
            values.cardInfo?.expMonth
              ? values.cardInfo.expMonth.toString().padStart(2, "0")
              : new Date().getMonth() + (1).toString().padStart(2, "0") // Default to the current month
          }
          options={[...Array(12)].map((_, i) => ({
            value: (i + 1).toString().padStart(2, "0"),
            label: (i + 1).toString().padStart(2, "0"),
          }))}
          onChange={(value) => handleChange("cardInfo.expMonth")(value)}
          errorMessage={touched.cardInfo?.expMonth && errors.cardInfo?.expMonth}
        />
        <DropdownField
          qaTag="qa-expiration-year"
          className="form-field-half"
          required
          label="Expiration Year"
          formName="cardInfo.expYear"
          selectedValue={values.cardInfo?.expYear?.toString() || ""}
          options={years}
          onChange={(value) => handleChange("cardInfo.expYear")(value)}
          errorMessage={touched.cardInfo?.expYear && errors.cardInfo?.expYear}
        />
      </div>
      {!isEditing && (
        <div className="form-field-container">
          <FormField
            qaTag="qa-cvv"
            label="CVV"
            required
            name="cardInfo.cvv"
            type="password"
            inputMode="numeric"
            value={values.cardInfo?.cvv || ""}
            maxLength={4}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={touched.cardInfo?.cvv && errors.cardInfo?.cvv}
            errorRefs={errorRefs}
          />{" "}
          {!isEditingExistingCard && (
            <div className="save-for-later">
              <input
                type="checkbox"
                className="qa-save checkbox"
                checked={saveCardToWallet}
                onChange={(e) => setSaveCardToWallet(!saveCardToWallet)}
              />
              <span>Save card for later</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
