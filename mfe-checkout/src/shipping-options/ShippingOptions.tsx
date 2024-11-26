import React, { useCallback, useEffect, useState } from "react";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import "./ShippingOptions.scss";
import { useAtom } from "jotai";
import { shippingData, total } from "../store";

export const ShippingOptions: React.FC = () => {
  const [shippingOptions, setShippingOptions] = useAtom(shippingData);
  const [totals, setTotals] = useAtom(total);

  useEffect(() => {
    const defaultShippingOptions = shippingOptions.shippingSelections.map(
      (selection) => {
        return {
          ...selection,
          isSelected:
            selection.method === shippingOptions.shippingSelected.method,
        };
      }
    );
    setShippingOptions({
      ...shippingOptions,
      shippingSelections: [...defaultShippingOptions],
    });
  }, []);

  const handleChange = (method: string) => {
    // Map through the selections to update the isSelected flag
    const updatedOptions = shippingOptions.shippingSelections.map((option) => ({
      ...option,
      isSelected: option.method === method, // Set true for selected, false for others
    }));
  
    // Find the newly selected shipping option
    const updatedShipping = updatedOptions.find((option) => option.isSelected);
  
    // Find the previously selected shipping option
    const previousShipping = shippingOptions.shippingSelected;
  
    // Calculate the new total, handling cases where shipping totals are zero or undefined
    const previousShippingTotal = previousShipping?.total || 0;
    const updatedShippingTotal = updatedShipping?.total || 0;
  
    const updatedTotalValue = 
      totals?.price
        ? +(totals.price - previousShippingTotal + updatedShippingTotal).toFixed(2)
        : +(updatedShippingTotal || 0).toFixed(2);
  
    // Update the shipping options state
    setShippingOptions({
      ...shippingOptions,
      shippingSelections: [...updatedOptions],
      shippingSelected: updatedShipping as ShippingSelection,
    });
  
    // Update the totals state
    setTotals({
      ...totals,
      price: updatedTotalValue,
    });
  };

  return (
    <div className="shipping-options-container">
      {shippingOptions?.shippingSelections.map((shippingOption, index) => (
        <ShippingOptionItem
          key={index}
          shippingOption={shippingOption}
          index={index}
          size={shippingOptions.shippingSelections.length - 1}
          isSelected={shippingOption.isSelected || false}
          onChange={() => handleChange(shippingOption.method)}
        />
      ))}
    </div>
  );
};
