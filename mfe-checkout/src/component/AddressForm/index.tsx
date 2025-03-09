import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchStatesAndCountries } from "../../api/service/CountriesAndStates";
import { Address } from "../../interfaces/Address";
import { DropdownOption } from "../../interfaces/DropdownOption";
import { DropdownField } from "../Form/Field/DropdownField";
import { FormField } from "../Form/Field/FormField";

interface IAddressFormProps {
  siteId: string;
  shippingAddress: Address;
  onAddressChange: (updatedAddress: Address, onSubmitAddress: Function) => void;
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
      setLoading(true);
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

  // Yup validation schema
  const validationSchema = Yup.object({
    first: Yup.string()
      .required("First name is required")
      .max(30, "First name cannot exceed 30 characters."),
    last: Yup.string()
      .required("Last name is required")
      .max(30, "Last name cannot exceed 30 characters."),
    address1: Yup.string()
      .required("Address Line 1 is required")
      .max(200, "Address cannot exceed 200 characters."),
    city: Yup.string()
      .required("City is required")
      .max(100, "City name cannot exceed 100 characters."),
    state: Yup.string().required("State/Province is required"),
    zip: Yup.string()
      .matches(/^\d{5}$/, "Zip code must be 5 digits")
      .required("Zip code is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      first: shippingAddress.first || "",
      last: shippingAddress.last || "",
      address1: shippingAddress.address1 || "",
      address2: shippingAddress.address2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      zip: shippingAddress.zip || "",
    },
    validationSchema,
    onSubmit: (values) => {
      onAddressChange(values, formik.submitForm);
    },
  });

  if (loading) {
    return <p>Loading states...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleAddressForm = () => {};

  return (
    <form onSubmit={handleAddressForm}>
      <div className="form-field-container">
        <FormField
          label="First Name"
          required
          name="first"
          value={formik.values.first}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.first && formik.errors.first}
        />
        <FormField
          label="Last Name"
          required
          name="last"
          value={formik.values.last}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.last && formik.errors.last}
        />
      </div>
      <div className="form-field-container-full">
        <FormField
          label="Address Line 1"
          required
          name="address1"
          value={formik.values.address1}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.address1 && formik.errors.address1}
        />
      </div>
      <div className="form-field-container-full">
        <FormField
          label="Address Line 2"
          name="address2"
          value={formik.values.address2}
          onChange={formik.handleChange}
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="City"
          required
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.city && formik.errors.city}
        />
        <DropdownField
          options={stateDropdownList}
          label="State/Province"
          required
          selectedValue={formik.values.state}
          formName="state"
          onChange={(e) => formik.setFieldValue("state", e)}
          errorMessage={formik.touched.state && formik.errors.state}
        />
      </div>
      <div className="form-field-container">
        <FormField
          label="Zip Code"
          required
          name="zip"
          value={formik.values.zip}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.zip && formik.errors.zip}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            name="isPoBox"
            onChange={formik.handleChange}
          />
          <span className="shipping-text">This address is a PO box</span>
        </div>
      </div>
    </form>
  );
};
