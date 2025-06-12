import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchStatesAndCountries } from "../../api/service/CountriesAndStates";
import { Address } from "../../interfaces/Address";
import { DropdownOption } from "../../interfaces/DropdownOption";
import { DropdownField } from "../Form/Field/DropdownField";
import { FormField } from "../Form/Field/FormField";
import { useContentStrings } from "../../hooks/useContentStrings";

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
  const { getString } = useContentStrings();
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
        setError(`${getString("failedToLoadStates")}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchCountryAndStateData();
  }, [siteId]);

  // Yup validation schema
  const validationSchema = Yup.object({
    first: Yup.string()
      .required(getString("errFirstNameEmpty"))
      .max(30, getString("firstNameMax30Chars")),
    last: Yup.string()
      .required(getString("errLastNameRequired"))
      .max(30, getString("lastNameMax30Chars")),
    address1: Yup.string()
      .required(getString("pcReg-errAddr1Req"))
      .max(200, getString("addressMax200Chars")),
    city: Yup.string()
      .required(getString("hpPortalAdmin-errCityReq"))
      .max(100, getString("cityNameExceeds100Characters")),
    state: Yup.string().required(getString("errRequiredState")),
    zip: Yup.string()
      .matches(/^\d{5}$/, getString("zipCodeLengthError"))
      .required(getString("nmEvents-errZipRequired")),
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
    return <p>{getString("loadingStates")}...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleAddressForm = () => {};

  return (
    <form onSubmit={handleAddressForm}>
      <div className="form-field-container">
        <FormField
          label={getString("firstName")}
          required
          name="first"
          value={formik.values.first}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.first && formik.errors.first}
        />
        <FormField
          label={getString("lastName")}
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
          label={getString("addressLine1")}
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
          label={getString("addressLine2")}
          name="address2"
          value={formik.values.address2}
          onChange={formik.handleChange}
        />
      </div>
      <div className="form-field-container">
        <FormField
          label={getString("city")}
          required
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.city && formik.errors.city}
        />
        <DropdownField
          options={stateDropdownList}
          label={getString("deliverDelayMessageStateOrProvince")}
          required
          selectedValue={formik.values.state}
          formName="state"
          onChange={(e) => formik.setFieldValue("state", e)}
          errorMessage={formik.touched.state && formik.errors.state}
        />
      </div>
      <div className="form-field-container">
        <FormField
          label={getString("zipCode")}
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
          <span className="shipping-text">
            {getString("thisAddressIsAPOBox")}
          </span>
        </div>
      </div>
    </form>
  );
};
