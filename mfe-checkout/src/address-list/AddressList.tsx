import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { Address } from "../interfaces/Address";
import { Add } from "../assets/icons/Add";
import "./AddressList.scss";

interface AppProps {
  addressBook: Address[];
  familyNameFirst: boolean;
  onSelectChange: (id: number | undefined) => void;
  onAddNewAddressClick: () => void;
  onEditAddressClick: (address: Address) => void;
}

export const AddressList: React.FC<AppProps> = ({
  addressBook,
  familyNameFirst,
  onSelectChange,
  onEditAddressClick,
  onAddNewAddressClick,
}) => {
  return (
    <div className="qa-addresses addresslist">
      {addressBook.map((address, index) => {
        const isSelected = address.isShip === 1 ? "selected" : "";
        const isFirst = index === 0 ? "start" : "";
        return (
          <div
            key={address.id}
            className={`addresslist-container ${isSelected} ${isFirst}`}
          >
            <div className="addresslist-item-holder">
              <RadioButton
                id={String(address.id)}
                name={"ship-address"}
                checked={address.isShip === 1}
                onChange={() => onSelectChange(address.id)}
              />
              <AddressDisplay
                address={address}
                familyNameFirst={familyNameFirst}
              />
            </div>
            <span
              className="qa-edit edit"
              onClick={() => onEditAddressClick(address)}
            >
              edit
            </span>
          </div>
        );
      })}
      {/* Add New Address Section */}
      <div
        className="qa-new-address addresslist-container end"
        onClick={onAddNewAddressClick}
      >
        <div className="address-center">
          <Add /> Add New Address
        </div>
      </div>
    </div>
  );
};
