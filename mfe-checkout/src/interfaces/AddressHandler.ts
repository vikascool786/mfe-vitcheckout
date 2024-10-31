import {Address} from "./Address";

export interface AddressHandler {
    verifyAddress: (address: Address) => void;
    setAddressToVerify: (address: Address) => void;
}