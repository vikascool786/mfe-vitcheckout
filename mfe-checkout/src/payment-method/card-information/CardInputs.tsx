import React from "react";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import "./CardInformation.scss";
import { useContentStrings } from "../../hooks/useContentStrings";

interface ICardInputProps {
  touched: any;
  errors: any;
  handleChange: any;
  values: any;
  handleBlur: any;
  onSubmit?: () => void; 
  isEditingExistingCard: boolean;
  saveCardToWallet?: boolean;
  setSaveCardToWallet?: any;
  isEditing: boolean;
  errorRefs?: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null;
  }> | null;
  isFromClick2Pay?: boolean;
}

export const CardInputs: React.FC<ICardInputProps> = ({
  touched,
  errors,
  handleChange,
  values,
  handleBlur,
  onSubmit,
  isEditingExistingCard,
  saveCardToWallet,
  setSaveCardToWallet,
  isEditing = false,
  errorRefs = null,
  isFromClick2Pay = false,
}) => {
  const { getString } = useContentStrings();
 
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formattedValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (formattedValue.length > 16)
      formattedValue = formattedValue.slice(0, 16); // Restrict to 16 digits

    handleChange("cardInfo.number")(formattedValue);
  };

  const currentYear = new Date().getFullYear();
  const selectedExpYear = parseInt(values.cardInfo?.expYear, 10);

  // Use the earlier of current year or selected year (to allow past expired dates like 2024 to still show up)
  const minYear = Math.min(currentYear, selectedExpYear || currentYear);
  const years = Array.from({ length: 15 }, (_, i) => {
    const year = minYear + i;
    return { value: year.toString(), label: year.toString() };
  });

  const getMonths = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const value = month.toString().padStart(2, "0");
      return { value, label: value };
    });

    return months;
  };

  const handleCVVKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };


  return (
    <>
      {!isEditing && (
        <FormField
          qaTag="qa-name"
          label={getString("nameOnCard")}
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
          label={getString("cardNumber")}
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
          label={getString("expirationMonth")}
          onBlur={handleBlur}
          formName="cardInfo.expMonth"
          placeholder="MM"
          selectedValue={
            values.cardInfo?.expMonth?.toString().padStart(2, "0") || ""
          }
          options={getMonths()}
          onChange={(value) => handleChange("cardInfo.expMonth")(value)}
          errorMessage={touched.cardInfo?.expMonth && errors.cardInfo?.expMonth}
        />
        <DropdownField
          qaTag="qa-expiration-year"
          className="form-field-half"
          required
          label={getString("expirationYear")}
          onBlur={handleBlur}
          placeholder="YYYY"
          formName="cardInfo.expYear"
          selectedValue={values.cardInfo?.expYear?.toString() || ""}
          options={years}
          onChange={(value) => {
            handleChange("cardInfo.expYear")(value);
          }}
          errorMessage={touched.cardInfo?.expYear && errors.cardInfo?.expYear}
        />
      </div>
      {isEditing ? (
        <p className="billing-address-styles">Billing Addess</p>
      ) : null}
      {!isEditing && (
        <div className="form-field-container">
          <FormField
            qaTag="qa-cvv"
            label={getString("cvv")}
            required
            name="cardInfo.cvv"
            type="text"
            disablePasswordManager
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-protonpass-ignore="true"
            inputMode="numeric"
            value={values.cardInfo?.cvv || ""}
            maxLength={4}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleCVVKeyDown}
            errorMessage={touched.cardInfo?.cvv && errors.cardInfo?.cvv}
            errorRefs={errorRefs}
          />{" "}
          {!isEditingExistingCard && !isFromClick2Pay && (
            <div className="save-for-later">
              <input
                type="checkbox"
                className="qa-save checkbox"
                checked={saveCardToWallet}
                onChange={(e) => setSaveCardToWallet(!saveCardToWallet)}
              />
              <span>{getString("saveCardForLater")}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
