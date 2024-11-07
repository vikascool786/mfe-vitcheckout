import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { Address } from "../interfaces/Address";
import {Add} from "../assets/icons/Add";

interface AppProps {
    addressBook: Address[];
    familyNameFirst: boolean;
}

export const AddressList: React.FC<AppProps> = ({ addressBook, familyNameFirst}) => {

    return (
        <div className="addresslist">
            {addressBook.map((address) => (
                <div className="addresslist-container">
                    <RadioButton id={String(address.id)} name={"ship-address"}/>
                    <AddressDisplay address={address} familyNameFirst={familyNameFirst}/>
                </div>
            ))}
            <div className="addresslist-container">
                <div>
                    <Add/> Add New Address
                </div>
            </div>
        </div>
    )
};
