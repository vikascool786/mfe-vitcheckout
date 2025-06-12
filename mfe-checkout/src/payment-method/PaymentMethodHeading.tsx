import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./PaymentMethods.scss";
import { useContentStrings } from "../hooks/useContentStrings";
import { FormSubTitle } from "../component/Form/SubTitle/FormSubTitle";

const PaymentMethodHeading: React.FC = () => {
  const { getString } = useContentStrings();
  return (
    <div className="pm-main-container">
      <div className="pm-container" id="pm-main">
        <div className="pm-title-container">
          <FormHeading title={getString('paymentMethod') as string} />
        </div>
        <div className="pm-title-container">
          <FormSubTitle title={`${getString("enterShippingForPayment") as string}.`} />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodHeading;
