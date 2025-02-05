import { useAtom, useSetAtom } from "jotai";
import React from "react";
import { buildOrder, removeProductFromCart } from "../api/service/Order";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import withLoader from "../hoc/withLoader";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { loadingAtom, orderAtom } from "../store";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import "./ShippingMethod.scss";
import {portalApiData} from "../checkout/portalAtom";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {OrderStore} from "../interfaces/Order";

interface IShippingMethodProps {
  shopperID: string;
}

const ShippingMethod: React.FC<IShippingMethodProps> = ({ shopperID }) => {
  const [orders, setOrder] = useAtom(orderAtom);
  const setLoading = useSetAtom(loadingAtom);
  const [portalData] = useAtom(portalApiData(shopperID));

  if (!orders) {
    return <p>Loading shipping methods...</p>;
  }

  const handleRemoveProduct = (storeKey: string, itemKey: string) => {
    setLoading(true);
    // Remove item from the store
    const updatedStores = { ...orders.stores };
    if (!updatedStores[storeKey]) {
      return;
    }
    updatedStores[storeKey].items = updatedStores[storeKey].items.filter(
      (item) => item.product_hash !== itemKey
    );

    // Update the order atom, if the store is empty, remove the store
    if (updatedStores[storeKey].items.length === 0) {
      delete updatedStores[storeKey];
    }

    setOrder({
      ...orders,
      stores: updatedStores,
    });

    removeProductFromCart(orders.id, itemKey).then(() => {
      buildOrder(
        generateChangeStoreResponse({
          ...orders,
          stores: updatedStores,
        })
      ).then((response) => setOrder(response.response.success.data));
    });
    setLoading(false);
  };

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      {orders?.stores && (
        <div className="shipping-item-container">
          {Object.entries(orders?.stores)
            .reverse()
            .map(([key, store]) => {
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
                            storeDetail={store?.store}
                            total={store?.totals}
                            onRemove={() =>
                              handleRemoveProduct(key, item.product_hash)
                            }
                            portalData={portalData}
                            isMaProduct={store?.store?.isMA === 1}
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

export default withLoader(ShippingMethod);
