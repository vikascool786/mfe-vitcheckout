import { Address } from "../interfaces/Address";

export interface Click2PayData {
    mcc: string;
    email: string;
    transactionAmount: number;
    hasAutoship: false;
    mobilePhone: string;
    cardBrands: string[];
    address: Address;
}