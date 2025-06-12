import * as Yup from "yup";

export const placeOrderSchema = (getString: any) =>
  Yup.object({
    autoshipTerms: Yup.boolean()
      .oneOf([true], getString("acceptAutoshipTerms"))
      .required("Required"),
  });
