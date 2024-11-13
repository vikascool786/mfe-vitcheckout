import {Address} from "./Address";

export interface ShopperSavedPayments {
    id: number;
    image: string;
    expirationDate: string;
    cardMask: string;
    preferred: boolean;
    type: string;
    address: Address;
    accountName: string;
}