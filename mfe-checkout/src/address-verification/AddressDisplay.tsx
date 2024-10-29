import React from "react";
import {Address} from "../interfaces/Address";

interface AppProps {
    address: Address;
}

export const AddressDisplay: React.FC<AppProps> = ({ address }) => {
    return (
        <div>{address.first} {address.last},{address.address1} {address.address2}, {address.city}, {address.state}, {address.zip}</div>
    )
};
