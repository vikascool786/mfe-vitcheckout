import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { FormSubTitle } from "../component/Form/SubTitle/FormSubTitle";

const ShippingMethodHeading: React.FC = () => {
  return (
    <div className="sm-main-container">
      <div className="sm-container" id="pm-main">
        <div className="sm-title-container">
          <FormHeading title="Shipping Methods" />
        </div>
        <div className="sm-title-container">
          <FormSubTitle title="Enter your shipping address to view available Shipping Methods." />
        </div>
      </div>
    </div>
  );
};

export default ShippingMethodHeading;
