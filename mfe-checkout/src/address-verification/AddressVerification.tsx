import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Alert } from "../assets/icons/Alert";
import "./AddressVerification.scss";
import { Button } from "../component/Button/Button";
import { AddressVerificationAddressList } from "./AddressVerificationAddressList";
import { Address } from "../interfaces/Address";
import { AddressDisplay } from "./AddressDisplay";
import { AddressList } from "../address-list/AddressList";
import { useContentStrings } from "../hooks/useContentStrings";

interface AppProps {
  addressList: Address[];
  addressToVerify: Address;
  hasAddressSuggestions: boolean;
  handleEditClick: () => void;
  handleUseSelectedAddress: () => void;
  setAddressToVerify: (address: Address) => void;
}

export const AddressVerification: React.FC<AppProps> = ({
  addressList,
  handleEditClick,
  addressToVerify,
  hasAddressSuggestions,
  setAddressToVerify,
  handleUseSelectedAddress,
}) => {
  const [isNewSelectedAddress, setIsNewSelectedAddress] =
  React.useState<boolean>(false);
  const { getString } = useContentStrings();

  const onChangeVericationAddress = (address: Address) => {
    // set is new selected address to false if address does not exist on the addressList
    if (address?.addressHash == 0) {
      setIsNewSelectedAddress(false);
    } else {
      setIsNewSelectedAddress(true);
    }

    setAddressToVerify(address);
  };
  return (
    <div>
      <div className="form-header">
        <FormHeading title={getString("addressVerificationRequired") as string} />
      </div>
      {!hasAddressSuggestions ? (
        <div className="avs-address-container">
          <div className="avs-alert-container">
            <Alert />
            <div className="avs-alert-container__text">
              {getString("noAddressSuggestions")}
            </div>
          </div>
          <div className="avs-address-container__address">
            <AddressDisplay address={addressToVerify} familyNameFirst={false} />
          </div>
          <div className="form-footer form-footer__dual-button">
            <Button
              label={getString("editAddress") as string}
              btnType="secondary"
              onClick={handleEditClick}
            />
            <Button
              label={getString("useEnteredAddress")as string}
              btnType="primary"
              onClick={handleUseSelectedAddress}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="avs-alert-container">
            <Alert />
            <span className="avs-alert-container__text">
              {getString("selectAddressCorrection")}
            </span>
          </div>
          <AddressVerificationAddressList
            addressList={addressList}
            addressToVerify={addressToVerify}
            setAddressToVerify={onChangeVericationAddress}
          />
          <div className="form-footer form-footer__dual-button">
            <Button
              label={getString("editAddress") as string}
              btnType="secondary"
              disabled={isNewSelectedAddress}
              onClick={handleEditClick}
            />
            <Button
              label={getString("useSelectedAddress") as string}
              btnType="primary"
              onClick={handleUseSelectedAddress}
            />
          </div>
        </>
      )}
    </div>
  );
};
