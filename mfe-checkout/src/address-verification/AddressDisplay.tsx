import React from "react";
import "./AddressVerification.scss";
import { Address } from "../interfaces/Address";

interface AppProps {
  address: Address;
  familyNameFirst: boolean;
}

export const AddressDisplay: React.FC<AppProps> = ({
  address,
  familyNameFirst,
}) => {
  const renderName = () => {
    if (familyNameFirst) {
      return (
        <>
          {address.last && address.first
            ? `${address.last} ${address.first},`
            : ""}
        </>
      );
    } else {
      return (
        <>
          {address.first && address.last
            ? `${address.first} ${address.last},`
            : ""}
        </>
      );
    }
  };

  const renderAddressLine1 = () => {
    return address.address1 ? `${address.address1},` : "";
  };

  const renderAddressLine2 = () => {
    return address.address2 ? `${address.address2},` : "";
  };

  const renderCityStateZip = () => {
    const cityStateZip = [];

    if (address.city) cityStateZip.push(address.city);
    if (address.state) cityStateZip.push(address.state);
    if (address.zip) cityStateZip.push(address.zip);

    return cityStateZip.join(", ");
  };

  return (
    <div className="add-display">
      {renderName()}
      {renderAddressLine1()}
      {renderAddressLine2()}
      {renderCityStateZip()}
    </div>
  );
};
