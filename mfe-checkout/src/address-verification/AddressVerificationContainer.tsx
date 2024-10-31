import React, {forwardRef, useImperativeHandle, useState} from "react";
import "./AddressVerification.scss"
import {Address} from "../interfaces/Address";
import {postAVS} from "../api/service/AddressVerification";
import {AddressVerification} from "./AddressVerification";
import {AddressHandler} from "../interfaces/AddressHandler";

export const AddressVerificationContainer = forwardRef<AddressHandler>((props, ref) => {
    const [addressToVerify, setAddressToVerify] = useState<Address>({first: '', last: '', address1: '', address2: '', zip: '', city: '', state: ''});
    const [hasAddressSuggestions, setAddressSuggestions] = useState(false);
    const [showAVS, setShowAVS] = useState(false);

    const [addressList, setAddressList] = useState<Address[]>([]);

    const handleEditClick =() => {
        console.log("edit button clicked");
        setShowAVS(false);
    };

    useImperativeHandle(ref, () => ({
        setAddressToVerify,
        verifyAddress
    }));

    const verifyAddress = async (addressEntered: Address) => {
        try {
            const response = await postAVS(
                addressEntered.address1,
                addressEntered.address2,
                addressEntered.city,
                addressEntered.state,
                addressEntered.zip,
                ""
            );
            const candidates = response.data.response.candidates;
            const mappedAddresses: Address[] = candidates.map((address: any) => ({
                first: addressEntered.first,
                last: addressEntered.last,
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
          <AddressVerification addressList={addressList} addressToVerify={addressToVerify} hasAddressSuggestions={hasAddressSuggestions} handleEditClick={handleEditClick}/>
      </div>
  )
});