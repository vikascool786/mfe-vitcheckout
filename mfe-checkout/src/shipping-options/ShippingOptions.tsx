import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { changeOrder } from "../api/service/Order";
import { OrderStore } from "../interfaces/Order";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import { loadingAtom, orderAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./ShippingOptions.scss";

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
    const updatedOptions = shippingSelections.map((option) => ({
      ...option,
      isSelected: option.method === method, // Set true for selected, false for others
    }));

    setShipping(updatedOptions);

    // console.log({
    //   ...order, // Spread other stores
    //   stores: {
    //     ...order.stores,
    //     [storeKey]: {
    //       ...store,
    //       shippingMethod: method,
    //     },
    //   },
    // });
    if (order) {
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
        .then((data) => {
          if (data && data.response.errors) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: data.response.errors.message,
            });
            setLoading(false);
            return;
          }

          // Set updated shipping options locally
          setShipping(updatedOptions);
          setLoading(false);
          setOrder(data.response.success.data);
        })
        .catch((er) => {
          // console.log("Error", er);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
          const updatedOptions = shippingSelections.map((option) => ({
            ...option,
            isSelected: option.method === method, // Set true for selected, false for others
          }));
          setShipping(updatedOptions);
        })
        .finally(() => {
          setLoading(false);
        });
    }
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
