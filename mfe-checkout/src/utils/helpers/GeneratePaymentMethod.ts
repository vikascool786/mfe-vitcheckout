import { IPaymentMethod } from "../../interfaces/PaymentMethod";

export const createPaymentMethod = (
  input: Partial<IPaymentMethod>
): IPaymentMethod => {
  return {
    id: input.id ?? 0,
    number: input.number ?? "",
    expires: input.expires ?? "",
    type: input.type ?? "",
    typeID: input.typeID ?? 0,
    html: input.html ?? "",
    imageUrl: input.imageUrl ?? "",
    categoryID: input.categoryID ?? 0,
    cvv: input.cvv ?? 0,
    token: input.token ?? "",
    accountName: input.accountName ?? "",
    expMonth: input.expMonth ?? 1,
    expYear: input.expYear ?? new Date().getFullYear(),
    addressId: input.addressId ?? 0,
    shopperAccountDisabled: input.shopperAccountDisabled ?? 0,
    links: input.links ?? [],
    preferred: input.preferred ?? false, // Default value for optional property
  };
};
