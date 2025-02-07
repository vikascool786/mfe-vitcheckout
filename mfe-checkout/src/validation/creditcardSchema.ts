import * as Yup from "yup";

const cardNumberRegex = /^(?:\d{6}[*]{6}\d{4}|\d{15,16})$/;

export const creditCardSchema = Yup.object({
  accountName: Yup.string().required("Name on Card is required"),
  number: Yup.string()
    .matches(
      cardNumberRegex,
      "Card Number must be 15 or 16 digits or a masked format (e.g., 222300******0007)"
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
    .matches(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits")
    .required("CVV is required"),
});
