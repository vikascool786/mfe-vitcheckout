import React, {RefObject, useEffect, useRef, useState} from "react";
import $ from 'jquery';
import 'parsleyjs';
import "./Checkout.scss";
import { Button } from "../component/Button/Button";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { FormField } from "../component/Form/Field/FormField";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Back } from "../assets/svgs/Back";
import { AddressVerificationContainer } from "../address-verification/AddressVerificationContainer";
import { AddressHandler } from "../interfaces/AddressHandler";
import {Address} from "../interfaces/Address";
import {AddressDisplay} from "../address-verification/AddressDisplay";
import {fetchStatesAndCountries} from "../api/service/CountriesAndStates";
import {DropdownOption} from "../interfaces/DropdownOption";

const testAddress: Address = {
  first: 'John',
  last: 'Doe',
  address1: "1 lower ragsdale dr",
  address2: "",
  zip: "93940",
  city: "Monterey",
  state: "CA"
};

export const Checkout: React.FC = () => {
  // State to manage whether the form is expanded or collapsed

  const [isExpanded, setIsExpanded] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address>(testAddress);
  const [showAVS, setShowAVS] = useState(false);
  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>([]);

  const shipFormRef = useRef<HTMLFormElement>(null);
  const childRef = useRef<AddressHandler>(null);

  // Function to toggle accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    $('.shipping-address-form').parsley();
  }, []);

  useEffect(() => {
    const siteId = "260" /*todo - need to update with dynamic siteId*/
    const fetchCountryAndStateData = async () => {
      try {
        const response = await fetchStatesAndCountries(siteId);
        const stateList: DropdownOption[] = response.map((item: any) => ({
          label: item.description,
          value: item.regionID,
        }));
        setStateDropdownList(stateList)
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchCountryAndStateData();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      const buildAddress = (formRef: RefObject<HTMLFormElement>) => {
      let address: Address = {first: '', last: '', address1: '', address2: '', zip: '', city: '', state: ''};
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        console.log("formData: " + formData);
        console.log("data: " + JSON.stringify(data));

        address.first = data.first as string | "";
        address.last = data.last as string | "";
        address.address1 = data.address1 as string | "";
        address.address2 = data.address2 as string | "";
        address.zip = data.zip as string | "";
        address.city = data.city as string | "";
        address.state = data.state as string | "";
      }
      return address;
    };

    if (childRef.current) {
      const addressEntered = buildAddress(shipFormRef);
      childRef.current.setAddressToVerify(addressEntered);
      try {
        const isValidAddress = await childRef.current.verifyAddress(addressEntered);
        setShippingAddress(addressEntered);
        setIsExpanded(false);
        setShowAVS(!isValidAddress);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleEditClick =() => {
    console.log("edit button clicked");
    setShowAVS(false);
    setIsExpanded(true);
  };

  return (
      <div>
        <form className="shipping-address-form" ref={shipFormRef} onSubmit={handleSaveAddress}>
          <div className={`${!showAVS ? "form-container" : "form-container__hide"}`}>
            <div className="form-header">
              <FormHeading title="Shipping Address"/>
              <Back
                  className={`accordion ${isExpanded ? "open" : "close"}`}
                  onClick={toggleAccordion}
              />
            </div>

            {/* show details fields based on accordion state close  */}
            {!isExpanded && (
                <div className="shipping-address">
                  <AddressDisplay address={shippingAddress}/>
                </div>
            )}

            {/* Conditionally render form fields based on accordion state */}
            {isExpanded && (
                <>
                  <div className="form-field-container">
                    <FormField label="First Name" required name={"first"} data-parsley-required="true" value={shippingAddress.first}/>
                    <FormField label="Last Name" required name={"last"} data-parsley-required="true" value={shippingAddress.last}/>
                  </div>
                  <div className="form-field-container-full">
                    <FormField label="Address Line 1" required name={"address1"} data-parsley-required="true" value={shippingAddress.address1}/>
                  </div>
                  <div className="form-field-container-full">
                    <FormField label="Address Line 2" name={"address2"} value={shippingAddress.address2}/>
                  </div>
                  <div className="form-field-container">
                    <FormField label="City" required name={"city"} data-parsley-required="true" value={shippingAddress.city}/>
                    <DropdownField options={stateDropdownList} label="State/Province" required selectedValue={shippingAddress.state}/>
                  </div>

                  <div className="form-field-container">
                    <FormField
                        label="Zip Code"
                        required
                        renderCheckBox={<Checkbox title="This address is a PO box"/>}
                        name={"zip"}
                        data-parsley-required="true"
                        value={shippingAddress.zip}
                    />
                    <FormField
                        label="Phone"
                        required
                        extraLabel="10 digits"
                        data-parsley-required="true"
                        renderCheckBox={
                          <Checkbox
                              title="Get Text Updates for this Order"
                              subtitle="Messaging data rates may apply."
                          />
                        }
                    />
                  </div>
                  <div className="form-footer">
                    <Button label="Save Shipping Address & Continue" type="primary"/>
                  </div>
                </>
            )}
          </div>
        </form>
        <AddressVerificationContainer ref={childRef} showAvs={showAVS} onClick={handleEditClick}/>
      </div>
  );
};