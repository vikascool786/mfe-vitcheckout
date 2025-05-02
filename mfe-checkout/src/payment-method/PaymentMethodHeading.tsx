import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./PaymentMethods.scss";
import { FormSubTitle } from "../component/Form/SubTitle/FormSubTitle";

const PaymentMethodHeading: React.FC = () => {
  return (
    <div className="pm-main-container">
      <div className="pm-container" id="pm-main">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
        </div>
        <div className="pm-title-container">
          <FormSubTitle title="Enter your shipping address to view available Payment Methods." />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodHeading;
