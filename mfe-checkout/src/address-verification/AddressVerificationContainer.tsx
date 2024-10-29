import React, {forwardRef, useImperativeHandle, useState} from "react";
import "./AddressVerification.scss"
import {Address} from "../interfaces/Address";
import {postAVS} from "../api/service/AddressVerification";
import {AddressVerification} from "./AddressVerification";
import {AddressHandler} from "../interfaces/AddressHandler";

const testAddress: Address = {
    first: 'John',
    last: 'Doe',
    address1: "123 test rd",
    address2: "",
    zip: "93940",
    city: "Monterey",
    state: "CA"
};

export const AddressVerificationContainer = forwardRef<AddressHandler>((props, ref) => {
    const [hasAddressSuggestions, setAddressSuggestions] = useState(false);
    const [showAVS, setShowAVS] = useState(false);

    const [addressList, setAddressList] = useState<Address[]>([]);

    const handleEditClick =() => {
        console.log("edit button clicked");
        setShowAVS(false);
    };

    useImperativeHandle(ref, () => ({
        verifyAddress
    }));

    const verifyAddress = async () => {
        try {
            const response = await postAVS(
                testAddress.address1,
                testAddress.address2,
                testAddress.city,
                testAddress.state,
                testAddress.zip,
                ""
            );
            const candidates = response.data.response.candidates;
            const mappedAddresses: Address[] = candidates.map((address: any) => ({
                first: testAddress.first,
                last: testAddress.last,
                address1: address.shpAddr1,
                address2: address.shpAddr2,
                zip: address.shpPCode,
                city: address.shpCity,
                state: address.shpState
            }));
            console.log(mappedAddresses);
            setAddressList(mappedAddresses);
            setAddressSuggestions(mappedAddresses.length > 1);
            setShowAVS(!response.data.response.indicators.validAddressIndicator);
        } catch (err) {
            console.log(err);
        } finally {
            console.log("done");
        }
    };

    if (!showAVS) {
        return null;
    }

  return (
      <div className="form-container">
          <AddressVerification addressList={addressList} addressToVerify={testAddress} hasAddressSuggestions={hasAddressSuggestions} handleEditClick={handleEditClick}/>
      </div>
  )
});