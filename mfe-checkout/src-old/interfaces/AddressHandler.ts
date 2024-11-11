import {Address} from "./Address";

export interface AddressHandler {
    verifyAddress: (address: Address) => Promise<boolean>;
    setAddressToVerify: (address: Address) => void;
}