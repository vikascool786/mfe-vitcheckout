import { Address } from "./Address";

export interface IPaymentMethod {
  id: number;
  number: string;
  expires: string;
  type: string;
  typeID: number;
  html: string;
  imageUrl: string;
  categoryID: number;
  cvv: number;
  token: string;
  accountName: string;
  expMonth: number;
  expYear: number;
  addressId: number;
  shopperAccountDisabled: number;
  links: Link[];
  preferred?: boolean
}

export interface Link {
  rel: string;
  href: string;
  type: string;
}
