import React from "react";
import {Address} from "../interfaces/Address";

interface AppProps {
    address: Address;
    familyNameFirst: boolean;
}

export const AddressDisplay: React.FC<AppProps> = ({ address, familyNameFirst }) => {
    if(familyNameFirst){
        return (
            <div>{address.last} {address.first},{address.address1} {address.address2}, {address.city}, {address.state}, {address.zip}</div>
        )
    }else{
        return (
            <div>{address.first} {address.last},{address.address1} {address.address2}, {address.city}, {address.state}, {address.zip}</div>
        )
    }
};
