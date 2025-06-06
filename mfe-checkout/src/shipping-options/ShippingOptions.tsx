import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { changeOrder } from "../api/service/Order";
import { OrderStore, OrderStores, ShippingSelection } from "../interfaces/Order";
import { ShippingOptionItem } from "../shipping-option-item/ShippingOptionItem";
import { loadingAtom, orderAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import "./ShippingOptions.scss";
import { Back } from "../assets/svgs/Back";
import { OOS_CONSOLIDATE_SPLIT_CODE } from "../interfaces/OrderConsolidationData";
import { getShippingSelectionById, isPickUp, SHIP_ID_STANDARD } from "../utils/ShippingMethodUtils";

interface IShippingOptions {
  store: OrderStore;
  storeKey: string;
  onSplitPickUpChange: (isSplitOrderPickUpSelected: boolean) => void;
  isSplitOrderPickUpSelected: boolean;
}

export const ShippingOptions: React.FC<IShippingOptions> = ({
  store,
  storeKey,
  onSplitPickUpChange,
  isSplitOrderPickUpSelected,
}) => {
  const { shippingSelections, shippingMethod } = store;
  const [order, setOrder] = useAtom(orderAtom); // Access both getter and setter for the atom
  const [shipping, setShipping] = useState(shippingSelections);
  const setLoading = useSetAtom(loadingAtom);
  const [isShipExpanded, setIsShipExpanded] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    ShippingSelection | null | undefined
  >(null);

  const getSelectedShippingOption = (
    selections: ShippingSelection[]
  ): ShippingSelection | null | undefined => {
    return (
      selections.find((selection) => selection.isSelected) || selections[0]
    );
  };

  useEffect(() => {
    const defaultShippingOptions = shippingSelections.map((selection) => {
      return {
        ...selection,
        isSelected: selection.method === shippingMethod || false,
      };
    });
    setShipping(defaultShippingOptions);
  }, [shippingSelections, shippingMethod]);

  useEffect(() => {
    setSelectedShippingMethod(getSelectedShippingOption(shipping));
  }, [shipping]);

  const handleStoreShippingSelections = (method: string, id: number): OrderStores => {
    let updatedStores = updateStoreShippingMethod(order?.stores || {}, storeKey, method);
    const isSplitOrder = order?.userOptions.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE;
      if(isSplitOrder && (isPickUp(id) || isSplitOrderPickUpSelected)){
        updatedStores = Object.entries(order.stores).reduce((acc, [storeId, store]) => {
          acc[storeId] = store.store.isMA
              ? {
                ...store,
                shippingMethod: storeId !== storeKey ? getSplitShipmentShipSelectionForStore(store, id)?.method || method : method,
              }
              : store;
          return acc;
        }, { ...updatedStores });
      }
      return updatedStores;
  }

  function updateStoreShippingMethod(stores: OrderStores, storeKey: string, method: string): OrderStores {
    const store = stores[storeKey];
    if (!store) return stores;

    return {
      ...stores,
      [storeKey]: {
        ...store,
        shippingMethod: method,
      },
    };
  }

  function getSplitShipmentShipSelectionForStore(store: OrderStore, shipId: number){
    const selectedShipId = !isPickUp(shipId) && isSplitOrderPickUpSelected ? SHIP_ID_STANDARD : shipId;
    onSplitPickUpChange(isPickUp(selectedShipId));
    return getShippingSelectionById(selectedShipId, store.shippingSelections);
  }

  const handleChange = (method: string, id: number) => {
    // Map through the selections to update the isSelected flag
    setLoading(true);
    const updatedOptions = shippingSelections.map((option) => ({
      ...option,
      isSelected: option.method === method, // Set true for selected, false for others
    }));

    setShipping(updatedOptions);
    setIsShipExpanded(false);

    if (order) {
      changeOrder(
        generateChangeStoreResponse({
          ...order, // Spread other stores
          stores: handleStoreShippingSelections(method, id),
        }),
        order.id
      )
        .then((data) => {
          if (data && data.response.errors) {
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

  const storeHasAutoshipItems = (order: OrderStore): boolean => {
    const autoshipItems = order.items.filter(
      (item) => item.autoshipFreq > 0 || item.autoShipId !== undefined
    );
    return autoshipItems.length > 0;
  };

  const toggleShipSelectionAccordion = () => {
    setIsShipExpanded(!isShipExpanded);
  };

  return (
    <div className="shipping-options-container">
      {shipping.length > 1 && (
        <div
          className="shipping-options-container__ship_selection"
          onClick={toggleShipSelectionAccordion}
        >
          <span className="change-shipping-method">Change Shipping Method</span>
          <Back
            className={`qa-expand mfe-accordion ${
              isShipExpanded ? "open" : "close"
            }`}
          />
        </div>
      )}
      {!isShipExpanded && selectedShippingMethod && (
        <div onClick={toggleShipSelectionAccordion}>
          <ShippingOptionItem
            key={selectedShippingMethod.id}
            shippingOption={selectedShippingMethod}
            index={0}
            size={0}
            isSelected={true}
            hasAutoship={storeHasAutoshipItems(store)}
          />
        </div>
      )}
      {isShipExpanded &&
        shipping
          .sort((a, b) => a.total - b.total)
          .map((shippingOption, index) => (
            <ShippingOptionItem
              key={shippingOption.id}
              shippingOption={shippingOption}
              index={index}
              size={shipping.length - 1}
              isSelected={
                shippingOption?.isSelected ||
                (index === 0 && !shipping.some((opt) => opt.isSelected))
              }
              onChange={() => handleChange(shippingOption.method, shippingOption.id)}
              hasAutoship={storeHasAutoshipItems(store)}
              isExpanded={true}
            />
          ))}
    </div>
  );
};
