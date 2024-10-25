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

  const handleChange = (selectedOptionIndex: number) => {
    const updatedOptions = shippingOptionsState.map((option, index) => ({
      ...option,
      isSelected: index === selectedOptionIndex, // Set true for selected, false for others
    }));

    setShippingOptionsState(updatedOptions); // Update state to re-render with new selection
  };

  return (
    <div className="shipping-options-container">
      {shippingOptionsState.map((shippingOption, index) => (
        <ShippingOptionItem
          key={index}
          shippingOption={shippingOption}
          index={index}
          size={shippingOptionsState.length - 1}
          onChange={() => handleChange(index)}
        />
      ))}
    </div>
  );
};
