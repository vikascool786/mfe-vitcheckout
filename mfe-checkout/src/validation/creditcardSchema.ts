import * as Yup from "yup";

const amexRegex = /^3[47]\d{13}$/; // Amex cards start with 34 or 37 and have 15 digits
const genericCardRegex = /^\d{16}$/; // All other cards must have 16 digits

export const creditCardSchema = (
  getString: (key: string, replacements?: string[]) => string | undefined
) =>
  Yup.object({
  accountName: Yup.string()
    .required(getString("orders-nameOnCard"))
    .max(30, getString("cardNameTooLong")),
  number: Yup.string()
    .test(
      "valid-card-number",
      getString("cardNumberLengthAmexOther") as string,
      (value) => {
        if (!value) return false;
        return amexRegex.test(value) || genericCardRegex.test(value);
      }
    )
    .required(getString("cardNumberRequired")),
  expMonth: Yup.number()
    .min(1, getString("cardInvalidMonth"))
    .max(12, getString("cardInvalidMonth"))
    .required(getString("cardExpirationMonthRequired"))
    .when("expYear", (expYear, schema) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      if (expYear[0] === currentYear) {
        return schema.min(currentMonth, getString("cardExpired"));
      }
      return schema;
    }),
  expYear: Yup.number()
    .min(new Date().getFullYear(), getString("cardExpirationYearRequired"))
    .required(getString("cardExpirationYearRequired")),
  cvv: Yup.string()
    .test(
      "valid-cvv",
      getString("cvvLengthError") as string,
      function (value) {
        if (!value) return false;
        const cardNumber = this.parent.number || "";
        if (amexRegex.test(cardNumber)) {
          return /^[0-9]{4}$/.test(value); // Amex requires exactly 4 digits
        }
        return /^[0-9]{3}$/.test(value); // Other cards require exactly 3 digits
      }
    )
    .min(3, getString("cvvMinLength"))
    .max(4, getString("cvvMaxLength"))
    .required(getString('cvvIsRequired')),
});
