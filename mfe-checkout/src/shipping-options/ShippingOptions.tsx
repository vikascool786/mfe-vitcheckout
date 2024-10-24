import React, { useState } from "react";
import "./ShippingOptions.scss";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";

interface IShippingOption {
  shippingType: string;
  arrivesIn: string;
  price: string;
  isSelected?: boolean;
}

interface IShippingOptionsProps {
  shippingOptions: IShippingOption[];
}

export const ShippingOptions: React.FC<IShippingOptionsProps> = ({
  shippingOptions,
}) => {
  const [shippingOptionsState, setShippingOptionsState] =
    useState<IShippingOption[]>(shippingOptions);
  return (
    <div className="shipping-options-container">
      {shippingOptionsState.map((shippingOption) => (
        <ShippingOptionItem shippingOption={shippingOption} />
      ))}
    </div>
  );
};
