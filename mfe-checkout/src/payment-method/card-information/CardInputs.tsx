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
  isEditingExistingCard,
  saveCardToWallet,
  setSaveCardToWallet,
  isEditing = false,
  errorRefs = null,
  isFromClick2Pay = false,
}) => {
 
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

const currentMonth = new Date().getMonth() + 1;

const getValidMonths = (selectedYear?: number | string) => {
  const selectedMonth = values.cardInfo?.expMonth?.toString().padStart(2, "0");
  const selectedYearInt = parseInt(selectedYear as string, 10);
  const includeExpired =
    selectedYearInt === currentYear &&
    parseInt(selectedMonth || "", 10) < currentMonth;

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const value = month.toString().padStart(2, "0");
    return { value, label: value };
  });

  return months.filter(({ value }) => {
    const monthInt = parseInt(value, 10);

    if (!selectedYear) return true;

    if (selectedYearInt > currentYear) return true;

    if (selectedYearInt === currentYear) {
      if (monthInt >= currentMonth) return true;
      // Include expired only if it's currently selected
      if (value === selectedMonth && includeExpired) return true;
      return false;
    }

    // Past year — don't allow anything unless it's selected
    return value === selectedMonth;
  });
};

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
          options={getValidMonths(values.cardInfo?.expYear)}
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
          onChange={(value) => {
            const validMonths = getValidMonths(value);
            const selectedMonth = values.cardInfo?.expMonth?.toString().padStart(2, "0");

            const isMonthStillValid = validMonths.some(
              (month) => month.value === selectedMonth
            );

            handleChange("cardInfo.expYear")(value);

            // Only update if invalid and different
            if (!isMonthStillValid && validMonths.length > 0) {
              const newMonth = validMonths[0]?.value;
              if (selectedMonth !== newMonth) {
                handleChange("cardInfo.expMonth")(newMonth);
              }
            }
          }}
          errorMessage={touched.cardInfo?.expYear && errors.cardInfo?.expYear}
        />
      </div>
      {isEditing ? <p className="billing-address-styles">Billing Addess</p> : null }
      {!isEditing && (
        <div className="form-field-container">
          <FormField
            qaTag="qa-cvv"
            label="CVV"
            required
            name="cardInfo.cvv"
            type="text"
            disablePasswordManager
            autoComplete="off" 
            data-1p-ignore data-lpignore="true" 
            data-protonpass-ignore="true"
            inputMode="numeric"
            value={values.cardInfo?.cvv || ""}
            maxLength={4}
            onChange={handleChange}
            onBlur={handleBlur}
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
              <span>Save card for later</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
