import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./AddressVerification.scss";
import { Address } from "../interfaces/Address";
import { postAVS } from "../api/service/AddressVerification";
import { AddressVerification } from "./AddressVerification";
import { AddressHandler } from "../interfaces/AddressHandler";
import { useAtom, useSetAtom } from "jotai";
import { loadingAtom } from "../store";

interface MyComponentProps {
  showAvs: boolean;
  onClick: () => void;
  onSelectAddress: () => void;
  errorMessage: string;
}

export const AddressVerificationContainer = forwardRef<
  AddressHandler,
  MyComponentProps
>((props, ref) => {
  const { showAvs } = props;
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
  const setLoading = useSetAtom(loadingAtom);

  const [addressList, setAddressList] = useState<Address[]>([]);

  useImperativeHandle(ref, () => ({
    setAddressToVerify,
    verifyAddress,
  }));

  const verifyAddress = async (addressEntered: Address): Promise<boolean> => {
    let isValidAddress = true;
    setLoading(true);
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
      setAddressSuggestions(mappedAddresses.length > 0);

      isValidAddress = await response.data.response.indicators
        .validAddressIndicator;
    } catch (err) {
      // console.log(err);
    } finally {
      setLoading(false);
      setAddressToVerify(addressEntered);
    }
    return isValidAddress;
  };

  if (!showAvs) return null;
  return (
    <div
      className={`${
        !props.showAvs
          ? "checkout-form-container__hide"
          : "checkout-form-container"
      }`}
    >
      {props.errorMessage && (
        <div className="error-message error-address-verification">
          {props.errorMessage}
        </div>
      )}
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
