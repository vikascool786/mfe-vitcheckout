import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "./AddressDisplay";
import { Address } from "../interfaces/Address";

interface AppProps {
  addressList: Address[];
  addressToVerify: Address;
  setAddressToVerify: (address: Address) => void;
}

export const AddressVerificationAddressList: React.FC<AppProps> = ({
  addressList,
  addressToVerify,
  setAddressToVerify,
}) => {
  const [selectedAddress, setSelectedAddress] =
    React.useState<Address>(addressToVerify);

  const handleSelectedAddressChange = (address: Address) => {
    setSelectedAddress(address);
    setAddressToVerify({
      ...addressToVerify,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      state: address.state,
      defaultaddr: true,
      zip: address.zip,
    });
  };

  return (
    <div className="addresslist">
      {addressList.map((add, index) => (
        <div
          key={add.id}
          onClick={() => handleSelectedAddressChange(add)}
          className={`addresslist-container addresslist-container__avs ${
            index == 0 && "start"
          } ${selectedAddress.addressHash === add.addressHash && "selected"}`}
        >
          <RadioButton
            id={String(index + 1)}
            name={"avs-select"}
            checked={selectedAddress.addressHash === add.addressHash}
            onChange={() => handleSelectedAddressChange(add)}
          />
          <AddressDisplay address={add} familyNameFirst={false} />
        </div>
      ))}
      {/*Address entered by shopper*/}
      <div
        className={`addresslist-container addresslist-container__avs end ${
          selectedAddress.id === addressToVerify.id && "selected"
        }`}
        onClick={() => handleSelectedAddressChange(addressToVerify)}
      >
        <RadioButton
          id={"0"}
          name={"avs-select"}
          checked={selectedAddress.id === addressToVerify.id}
          onChange={() => handleSelectedAddressChange(addressToVerify)}
        />
        <div className="addresslist-container__content">
          <div className="addresslist__subtitle">Address Entered</div>
          <AddressDisplay address={addressToVerify} familyNameFirst={false} />
        </div>
      </div>
    </div>
  );
};
