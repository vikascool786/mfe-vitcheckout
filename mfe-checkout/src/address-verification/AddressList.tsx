import React from "react";
import {RadioButton} from "../component/RadioButton/RadioButton";
import {AddressDisplay} from "./AddressDisplay";
import {Address} from "../interfaces/Address";

interface AppProps {
    addressList: Address[],
    addressToVerify: Address;
}

export const AddressList: React.FC<AppProps> = ({ addressList, addressToVerify }) => {

    return (
        <div>
            {addressList.map((add, index) => (
                <div className="avs-addresslist-container">
                    <RadioButton id={String(index + 1)} name={"avs-select"}/>
                    <AddressDisplay address={add}/>
                </div>
            ))}
            {/*Address entered by shopper*/}
            <div className="avs-addresslist-container">
                <RadioButton id={"0"} name={"avs-select"}/>
                <div className="avs-addresslist-container__content">
                    <div className="avs-addresslist__subtitle">Address Entered</div>
                        <AddressDisplay address={addressToVerify}/>
                    </div>
                </div>
            </div>
            )
            };
