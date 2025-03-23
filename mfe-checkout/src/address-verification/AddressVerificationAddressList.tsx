import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "./AddressDisplay";
import { Address } from "../interfaces/Address";

interface AppProps {
    addressList: Address[],
    addressToVerify: Address;
}

export const AddressVerificationAddressList: React.FC<AppProps> = ({ addressList, addressToVerify }) => {

    return (
        <div className="addresslist">
            {addressList.map((add, index) => (
                <div className={`addresslist-container addresslist-container__avs ${index == 0 && 'start'}`}>
                    <RadioButton id={String(index + 1)} name={"avs-select"} />
                    <AddressDisplay address={add} familyNameFirst={false} />
                </div>
            ))}
            {/*Address entered by shopper*/}
            <div className="addresslist-container addresslist-container__avs selected end">
                <RadioButton id={"0"} name={"avs-select"} checked={true}/>
                <div className="addresslist-container__content">
                    <div className="addresslist__subtitle">Address Entered</div>
                    <AddressDisplay address={addressToVerify} familyNameFirst={false}/>
                </div>
            </div>
        </div>
    )
};
