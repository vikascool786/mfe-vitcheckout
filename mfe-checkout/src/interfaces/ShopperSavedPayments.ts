import { Address } from "./Address";

export interface ShopperSavedPayments {
  id: number;
  image: string;
  expirationDate: string;
  cardMask: string;
  preferred: boolean;
  type: number;
  address: Address;
  accountName: string;
}
