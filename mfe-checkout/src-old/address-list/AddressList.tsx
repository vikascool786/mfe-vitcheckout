import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { Address } from "../interfaces/Address";
import { Add } from "../assets/icons/Add";
import "./AddressList.scss";

interface AppProps {
  addressBook: Address[];
  familyNameFirst: boolean;
  onAddNewAddressClick: () => void;
}

export const AddressList: React.FC<AppProps> = ({
  addressBook,
  familyNameFirst,
  onAddNewAddressClick,
}) => {
  return (
    <div className="addresslist">
      {addressBook.map((address, index) => {
        const isSelected = index === 0 ? "selected" : "";
        const isFirst = index === 0 ? "start" : "";
        return (
          <div
            className={`addresslist-container ${isSelected} ${isFirst}`}
          >
            <RadioButton id={String(address.id)} name={"ship-address"} checked={!!isSelected} />
            <AddressDisplay
              address={address}
              familyNameFirst={familyNameFirst}
            />
          </div>
        );
      })}
      <div className={`addresslist-container end`} onClick={onAddNewAddressClick}>
        <div className="address-center">
          <Add /> Add New Address
        </div>
      </div>
    </div>
  );
};
