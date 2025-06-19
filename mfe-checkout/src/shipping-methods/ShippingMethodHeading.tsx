import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { FormSubTitle } from "../component/Form/SubTitle/FormSubTitle";
import { useContentStrings } from "../hooks/useContentStrings";

const ShippingMethodHeading: React.FC = () => {
  const { getString } = useContentStrings();
  return (
    <div className="sm-main-container">
      <div className="sm-container" id="pm-main">
        <div className="sm-title-container">
          <FormHeading title={getString("shippingMethods") as string} />
        </div>
        <div className="sm-title-container">
          <FormSubTitle title={`${getString("enterShippingForShipping") as string}.`} />
        </div>
      </div>
    </div>
  );
};

export default ShippingMethodHeading;
