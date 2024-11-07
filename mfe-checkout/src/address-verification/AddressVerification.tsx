import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Alert } from "../assets/icons/Alert";
import "./AddressVerification.scss";
import { Button } from "../component/Button/Button";
import { AddressVerificationAddressList } from "./AddressVerificationAddressList";
import { Address } from "../interfaces/Address";
import { AddressDisplay } from "./AddressDisplay";

interface AppProps {
  addressList: Address[];
  addressToVerify: Address;
  hasAddressSuggestions: boolean;
  handleEditClick: () => void;
  handleSelectedAddressClick: () => void;
}

export const AddressVerification: React.FC<AppProps> = ({
  addressList,
  addressToVerify,
  hasAddressSuggestions,
  handleEditClick,
  handleSelectedAddressClick,
}) => {
  return (
    <div>
      <div className="form-header">
        <FormHeading title="Address Verification Required" />
      </div>
      {!hasAddressSuggestions ? (
        <div className="avs-address-container">
          <div className="avs-alert-container">
            <Alert />
            <div className="avs-alert-container__text">
              There are no suggestions for the address entered
            </div>
          </div>
          <div className="avs-address-container__address">
            <AddressDisplay address={addressToVerify} familyNameFirst={false} />
          </div>
          <div className="form-footer form-footer__dual-button">
            <Button
              label="Edit Address"
              type="secondary"
              onClick={handleEditClick}
            />
            <Button label="Use Address Entered" type="primary" onClick={handleSelectedAddressClick} />
          </div>
        </div>
      ) : (
        <>
          <div className="avs-alert-container">
            <Alert />
            <span className="avs-alert-container__text">
              Please select one of the address corrections, or you may select to
              keep the address as entered
            </span>
          </div>
          <AddressVerificationAddressList
            addressList={addressList}
            addressToVerify={addressToVerify}
          />
          <div className="form-footer form-footer__dual-button">
            <Button
              label="Edit Address"
              type="secondary"
              onClick={() => handleEditClick()}
            />
            <Button label="Use Selected Address" type="primary" />
          </div>
        </>
      )}
    </div>
  );
};
