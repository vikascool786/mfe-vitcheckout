import { useAtom } from "jotai";
import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { orderData } from "../store";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import "./ShippingMethod.scss";

export const ShippingMethod: React.FC = ({}) => {
  const [orders] = useAtom(orderData);
  if (!orders?.id) {
    return <p>Loading shipping methods...</p>;
  }


  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      {orders?.stores && (
        <div className="shipping-item-container">
          {Object.values(orders?.stores).map((store, index) => {
            return (
              <>
                {store && (
                  <div key={index}>
                    <div className="shipping-catolog-name">
                      {getCatalogName(store)}
                    </div>
                    {store.items.map((item, itemIndex) => (
                      <>
                        <div key={itemIndex}>
                          <ShippingItem item={item} />
                        </div>
                      </>
                    ))}
                    {/* Pass store-specific shippingSelections */}
                    {store.shippingSelections && (
                      <ShippingOptions
                        shippingSelections={store.shippingSelections}
                        selectedItem={store.shippingMethod}
                      />
                    )}
                  </div>
                )}
              </>
            );
          })}
        </div>
      )}
    </div>
  );
};
