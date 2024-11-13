import React, { useEffect, useState } from "react";
import { Address } from "../../interfaces/Address";
import { DropdownField } from "../Form/Field/DropdownField";
import { FormField } from "../Form/Field/FormField";
import { Checkbox } from "../Form/Checkbox/Checkbox";
import { DropdownOption } from "../../interfaces/DropdownOption";
import { fetchStatesAndCountries } from "../../api/service/CountriesAndStates";
import { STATES } from "../../data/States";

interface IAddressFormProps {
  siteId: string; // Pass siteId as a prop to make it dynamic
  shippingAddress: Address;
  onAddressChange: (updatedAddress: Address) => void; // Callback for address change
}

export const AddressForm: React.FC<IAddressFormProps> = ({
  siteId,
  shippingAddress,
  onAddressChange,
}) => {
  const [stateDropdownList, setStateDropdownList] = useState<DropdownOption[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch states and countries on mount
  useEffect(() => {
    const fetchCountryAndStateData = async () => {
      try {
        const response = await fetchStatesAndCountries(siteId);
        const stateList: DropdownOption[] = response.map((item: any) => ({
          label: item.description,
          value: item.regionID,
        }));
        setStateDropdownList(stateList);
      } catch (error) {
        setError("Failed to load state data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCountryAndStateData();
  }, [siteId]);

  // Update address field
  const handleInputChange = (field: keyof Address, value: string) => {
    const updatedAddress = { ...shippingAddress, [field]: value };
    onAddressChange(updatedAddress);
  };

  if (loading) {
    return <p>Loading states...</p>; // Loader while fetching data
  }

  if (error) {
    return <p>{error}</p>; // Display error message if data fetch fails
  }

  return (
    <>
      <div className="form-field-container">
        <FormField
          label="First Name"
          required
          name="first"
          data-parsley-required="true"
          value={shippingAddress.first}
          onChange={(e) => handleInputChange("first", e.target.value)} // Controlled input
        />
        <FormField
          label="Last Name"
          required
          name="last"
          data-parsley-required="true"
          value={shippingAddress.last}
          onChange={(e) => handleInputChange("last", e.target.value)} // Controlled input
        />
      </div>
      <div className="form-field-container-full">
        <FormField
          label="Address Line 1"
          required
          name="address1"
          data-parsley-required="true"
          value={shippingAddress.address1}
          onChange={(e) => handleInputChange("address1", e.target.value)} // Controlled input
        />
      </div>
      <div className="form-field-container-full">
        <FormField
          label="Address Line 2"
          name="address2"
          value={shippingAddress.address2}
          onChange={(e) => handleInputChange("address2", e.target.value)} // Controlled input
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="City"
          required
          name="city"
          data-parsley-required="true"
          value={shippingAddress.city}
          onChange={(e) => handleInputChange("city", e.target.value)} // Controlled input
        />
        <DropdownField
          options={stateDropdownList}
          label="State/Province"
          required
          selectedValue={shippingAddress.state}
          formName="state"
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="Zip Code"
          required
          name="zip"
          data-parsley-required="true"
          value={shippingAddress.zip}
          onChange={(e) => handleInputChange("zip", e.target.value)} // Controlled input
        />
        <div className="save-for-later">
          <input className="checkbox" type="checkbox" />
          <span className="shipping-text">This address is a PO box</span>
        </div>
      </div>
    </>
  );
};
