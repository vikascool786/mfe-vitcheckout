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
            ? `${address.last} ${address.first}, `
            : ""}
        </>
      );
    } else {
      return (
        <>
          {address.first && address.last
            ? `${address.first} ${address.last}, `
            : ""}
        </>
      );
    }
  };

  const renderAddressLine1 = () => {
    return address.address1 ? `${address.address1}, ` : "";
  };

  const renderAddressLine2 = () => {
    return address.address2 ? `${address.address2}, ` : "";
  };

  const renderCityStateZip = () => {
    const cityStateZip = [];

    if (address.city)
      cityStateZip.push(<span className="nowrap">{address.city}</span>);
    if (address.state)
      cityStateZip.push(<span className="nowrap">{address.state}</span>);
    if (address.zip)
      cityStateZip.push(<span className="nowrap">{address.zip}</span>);

    return cityStateZip.map((element, index) => (
      <React.Fragment key={index}>
        {element}
        {index < cityStateZip.length - 1 ? ", " : ""}
      </React.Fragment>
    ));
  };

  return (
    <div className="add-display">
      <span className="nowrap">{renderName()}</span>
      <span className="nowrap">{renderAddressLine1()}</span>
      <span className="nowrap">{renderAddressLine2()}</span>
      <div>{renderCityStateZip()}</div>
    </div>
  );
};
