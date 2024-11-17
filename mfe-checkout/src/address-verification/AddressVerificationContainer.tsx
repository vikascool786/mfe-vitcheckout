import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./AddressVerification.scss";
import { Address } from "../interfaces/Address";
import { postAVS } from "../api/service/AddressVerification";
import { AddressVerification } from "./AddressVerification";
import { AddressHandler } from "../interfaces/AddressHandler";

interface MyComponentProps {
  showAvs: boolean;
  onClick: () => void;
  onSelectAddress: () => void;
}

export const AddressVerificationContainer = forwardRef<
  AddressHandler,
  MyComponentProps
>((props, ref) => {
  const [addressToVerify, setAddressToVerify] = useState<Address>({
    id: 0,
    isPrimary: 0,
    first: "",
    last: "",
    address1: "",
    address2: "",
    zip: "",
    city: "",
    state: "",
    phone: "",
  } as Address);
  const [hasAddressSuggestions, setAddressSuggestions] = useState(false);

  const [addressList, setAddressList] = useState<Address[]>([]);

  useImperativeHandle(ref, () => ({
    setAddressToVerify,
    verifyAddress,
  }));

  const verifyAddress = async (addressEntered: Address): Promise<boolean> => {
    let isValidAddress = true;
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
        state: address.shpState,
        phone: addressEntered.phone,
      }));
      setAddressList(mappedAddresses);
      setAddressSuggestions(mappedAddresses.length > 1);
      isValidAddress = await response.data.response.indicators
        .validAddressIndicator;
    } catch (err) {
      console.log(err);
    } finally {
      console.log("done");
    }
    return isValidAddress;
  };

  return (
    <div
      className={`${
        !props.showAvs ? "form-container__hide" : "form-container"
      }`}
    >
      <AddressVerification
        addressList={addressList}
        addressToVerify={addressToVerify}
        hasAddressSuggestions={hasAddressSuggestions}
        handleEditClick={props.onClick}
        handleUseSelectedAddress={props.onSelectAddress}
      />
    </div>
  );
});
