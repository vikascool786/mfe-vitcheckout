import * as Yup from "yup";

const amexRegex = /^3[47]\d{13}$/; // Amex cards start with 34 or 37 and have 15 digits
const genericCardRegex = /^\d{16}$/; // All other cards must have 16 digits

export const creditCardSchema = Yup.object({
  accountName: Yup.string()
    .required("Name on Card is required")
    .max(30, "Name cannot exceed 30 characters."),
  number: Yup.string()
    .test(
      "valid-card-number",
      "Card Number must be 15 digits for Amex or 16 digits for other cards",
      (value) => {
        if (!value) return false;
        return amexRegex.test(value) || genericCardRegex.test(value);
      }
    )
    .required("Card Number is required"),
  expMonth: Yup.number()
    .min(1, "Invalid month")
    .max(12, "Invalid month")
    .required("Expiration Month is required"),
  expYear: Yup.number()
    .min(new Date().getFullYear(), "Invalid year")
    .required("Expiration Year is required"),
  cvv: Yup.string()
    .test(
      "valid-cvv",
      "CVV must be 4 digits for Amex or 3 digits for other cards",
      function (value) {
        if (!value) return false;
        const cardNumber = this.parent.number || "";
        if (amexRegex.test(cardNumber)) {
          return /^[0-9]{4}$/.test(value); // Amex requires exactly 4 digits
        }
        return /^[0-9]{3}$/.test(value); // Other cards require exactly 3 digits
      }
    )
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV cannot exceed 4 digits")
    .required("CVV is required"),
});
