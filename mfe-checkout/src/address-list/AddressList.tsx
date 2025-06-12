import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { AddressDisplay } from "../address-verification/AddressDisplay";
import { Address } from "../interfaces/Address";
import { Add } from "../assets/icons/Add";
import "./AddressList.scss";
import { useContentStrings } from "../hooks/useContentStrings";

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
  const { getString } = useContentStrings();

  return (
    <div className="qa-addresses addresslist">
      {addressBook.map((address, index) => {
        const isSelected = address.isShip === 1 ? "selected" : "";
        const isFirst = index === 0 ? "start" : "";
        return (
          <div
            key={address.id}
            className={`addresslist-container ${isSelected} ${isFirst}`}
            onClick={
              address.isShip !== 1
                ? () => onSelectChange(address.id)
                : undefined
            }
          >
            <div className="addresslist-item-holder">
              <RadioButton
                id={String(address.id)}
                name={"ship-address"}
                checked={address.isShip === 1}
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
              {getString("edit")?.toLocaleLowerCase()}
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
          <Add /> {getString("addNewAddress")}
        </div>
      </div>
    </div>
  );
};
