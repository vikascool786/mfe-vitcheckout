import {Address} from "./Address";

export interface AddressHandler {
    verifyAddress: (address: Address) => Promise<{ isValidAddress: boolean; hashCode: string }>;
    setAddressToVerify: (address: Address) => void;
}