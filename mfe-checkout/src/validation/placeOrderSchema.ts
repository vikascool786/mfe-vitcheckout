import * as Yup from "yup";

export const placeOrderSchema = Yup.object({
    autoshipTerms: Yup.boolean()
        .oneOf([true], "You must accept the Autoship terms and conditions.")
        .required("Required"),
});
