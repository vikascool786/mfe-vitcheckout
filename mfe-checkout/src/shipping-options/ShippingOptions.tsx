import React, { useEffect, useState } from "react";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import "./ShippingOptions.scss";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";

interface IShippingOptions {
  shippingSelections: ShippingSelection[];
  selectedItem: string;
}

export const ShippingOptions: React.FC<IShippingOptions> = ({
  selectedItem,
  shippingSelections,
}) => {
  const [shipping, setShipping] = useState(shippingSelections);

  useEffect(() => {
    const defaultShippingOptions = shippingSelections.map((selection) => {
      return {
        ...selection,
        isSelected: selection.method === selectedItem || false,
      };
    });
    setShipping(defaultShippingOptions);
  }, []);

  const handleChange = (method: string) => {
    // Map through the selections to update the isSelected flag
    const updatedOptions = shippingSelections.map((option) => ({
      ...option,
      isSelected: option.method === method, // Set true for selected, false for others
    }));

    setShipping(updatedOptions)
  };

  return (
    <div className="shipping-options-container">
      {shipping.map((shippingOption, index) => (
        <ShippingOptionItem
          key={index}
          shippingOption={shippingOption}
          index={index}
          size={shippingSelections.length - 1}
          isSelected={shippingOption.isSelected || false}
          onChange={() => handleChange(shippingOption.method)}
        />
      ))}
    </div>
  );
};
