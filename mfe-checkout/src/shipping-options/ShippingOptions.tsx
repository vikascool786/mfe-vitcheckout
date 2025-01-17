import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { changeOrder } from "../api/service/Order";
import { OrderStore } from "../interfaces/Order";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import { loadingAtom, orderAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./ShippingOptions.scss";
import Swal from "sweetalert2";

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
  const setLoading = useSetAtom(loadingAtom);

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
    setLoading(true);

    changeOrder(
      generateChangeStoreResponse({
        ...order, // Spread other stores
        stores: {
          ...order.stores,
          [storeKey]: {
            ...store,
            shippingMethod: method,
          },
        },
      }),
      order.id
    )
      .then((response) => {
        if (response) {
          if (response.response.errors.message) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.response.errors.message,
            });
            setLoading(false);
            return;
          }
          const updatedOptions = shippingSelections.map((option) => ({
            ...option,
            isSelected: option.method === method, // Set true for selected, false for others
          }));

          // Set updated shipping options locally
          setShipping(updatedOptions);
          setLoading(false);
          setOrder(response.response.success.data);
        }
      })
      .catch((er) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      })
      .finally(() => {
        setLoading(false);
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
          isSelected={shippingOption?.isSelected || false}
          onChange={() => handleChange(shippingOption.method)}
        />
      ))}
    </div>
  );
};
