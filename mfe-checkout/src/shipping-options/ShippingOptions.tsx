import React, { useCallback, useEffect, useState } from "react";
import "./ShippingOptions.scss";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import { ShippingSelection } from "../interfaces/ShippingMethod";

interface IShippingOptionsProps {
  shippingOptions: ShippingSelection[];
  shippingSelected: string;
}

export const ShippingOptions: React.FC<IShippingOptionsProps> = ({
  shippingSelected,
  shippingOptions,
}) => {
  const [shippingOptionsState, setShippingOptionsState] = useState<
    ShippingSelection[]
  >([]);

  useEffect(() => {
    // Initialize state with isSelected based on the method prop
    const updatedShippingOptions = shippingOptions.map((option) => ({
      ...option,
      isSelected: option.method === shippingSelected,
    }));
    setShippingOptionsState(updatedShippingOptions);
  }, [shippingOptions, shippingSelected]);

  const handleChange = useCallback(
    (method: string) => {
      const updatedOptions = shippingOptionsState.map((option) => ({
        ...option,
        isSelected: shippingSelected === method, // Set true for selected, false for others
      }));
      setShippingOptionsState(updatedOptions); // Update state to re-render with new selection
    },
    [shippingOptionsState]
  );

  return (
    <div className="shipping-options-container">
      {shippingOptionsState.map((shippingOption, index) => (
        <ShippingOptionItem
          key={index}
          shippingOption={shippingOption}
          index={index}
          size={shippingOptionsState.length - 1}
          isSelected={shippingOption.isSelected}
          onChange={() => handleChange(shippingOption.method)}
        />
      ))}
    </div>
  );
};
