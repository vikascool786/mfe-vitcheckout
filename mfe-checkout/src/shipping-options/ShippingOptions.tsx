import React, { useEffect, useState } from "react";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import "./ShippingOptions.scss";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import { OrderStore } from "../interfaces/Order";
import { useAtom, useAtomValue } from "jotai";
import { orderAtom } from "../store";

interface IShippingOptions {
  store: OrderStore;
  storeKey: string;
}

export const ShippingOptions: React.FC<IShippingOptions> = ({
  store,
  storeKey,
}) => {
  const { shippingSelections, shippingMethod } = store;
  const [order, setOrder] = useAtom(orderAtom); // Access both getter and setter for the atom
  const [shipping, setShipping] = useState(shippingSelections);

  useEffect(() => {
    const defaultShippingOptions = shippingSelections.map((selection) => {
      return {
        ...selection,
        isSelected: selection.method === shippingMethod || false,
      };
    });
    setShipping(defaultShippingOptions);
  }, [shippingSelections, shippingMethod]);

  const handleChange = (method: string) => {
    // Map through the selections to update the isSelected flag
    const updatedOptions = shippingSelections.map((option) => ({
      ...option,
      isSelected: option.method === method, // Set true for selected, false for others
    }));

    // Set updated shipping options locally
    setShipping(updatedOptions);

    // Update the correct store in the global OrderStores object
    setOrder({
      ...order, // Spread other stores
      stores: {
        ...order.stores,
        [storeKey]: {
          ...store,
          shippingMethod: method,
        },
      },
    });
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
