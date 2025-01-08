import { useAtom } from "jotai";
import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import "./ShippingMethod.scss";
import { orderAtom } from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { changeOrder } from "../api/service/Order";

export const ShippingMethod: React.FC = ({}) => {
  const [orders, setOrder] = useAtom(orderAtom);
  if (!orders) {
    return <p>Loading shipping methods...</p>;
  }

  const handleRemoveProduct = (storeKey: string, itemKey: string) => {
    // Remove item from the store
    const updatedStores = { ...orders.stores };
    if (!updatedStores[storeKey]) {
      return;
    }
    updatedStores[storeKey].items = updatedStores[storeKey].items.filter(
      (item) => item.caption !== itemKey
    );

    // Update the order atom, if the store is empty, remove the store
    if (updatedStores[storeKey].items.length === 0) {
      delete updatedStores[storeKey];
    }

    setOrder({
      ...orders,
      stores: updatedStores,
    });

    changeOrder(
      generateChangeStoreResponse({
        ...orders,
        stores: updatedStores,
      }),
      orders.id
    )
      .then((resonse) => {
        if (!resonse.response.errors) {
          setOrder(resonse.response.success.data);
        }
      })
      .catch((error) => {
        console.error("Error removing product from order", error);
      });
  };

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      {orders?.stores && (
        <div className="shipping-item-container">
          {Object.entries(orders?.stores).map(([key, store], index) => {
            return (
              store && (
                <div key={key}>
                  <div className="shipping-catolog-name">
                    {getCatalogName(store)}
                  </div>
                  {store.items &&
                    store.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <ShippingItem
                          item={item}
                          onRemove={() =>
                            handleRemoveProduct(key, item.caption)
                          }
                        />
                      </div>
                    ))}
                  {/* Pass store-specific shippingSelections */}
                  {store.shippingSelections && (
                    <ShippingOptions store={store} storeKey={key} />
                  )}
                </div>
              )
            );
          })}
        </div>
      )}
    </div>
  );
};
