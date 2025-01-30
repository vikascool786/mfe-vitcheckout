import * as Yup from "yup";

export const creditCardSchema = Yup.object({
  accountName: Yup.string().required("Name on Card is required"),
  number: Yup.string()
    .matches(/^\d{15,16}$/, "Card Number must be 15 or 16 digits")
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
