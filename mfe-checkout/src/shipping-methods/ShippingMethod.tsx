import { useAtom } from "jotai";
import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { shippingData } from "../store";
import "./ShippingMethod.scss";

export const ShippingMethod: React.FC = ({}) => {
  const [shipping] = useAtom(shippingData);
  if (!shipping?.shippingSelections) {
    return <p>Loading shipping methods...</p>;
  }

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className="shipping-item-container">
        {shipping.shippingItems.map((item) => (
          <ShippingItem product={item} />
        ))}
      </div>

      <ShippingOptions />
    </div>
  );
};
